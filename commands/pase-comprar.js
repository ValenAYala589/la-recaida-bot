const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const paseDb = require('../pasedb');
const { COLOR_ACENTO, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doomsday-comprar')
    .setDescription('Comprá el siguiente nivel del Pase Doomsday gastando Lunas'),

  async execute(interaction) {
    const config = paseDb.getConfig();
    const nivelActual = paseDb.getNivelUsuario(interaction.user.id);

    if (nivelActual >= config.nivelMaximo) {
      return interaction.reply({ content: `🏆 Ya estás en el nivel máximo (${config.nivelMaximo}).`, ephemeral: true });
    }

    const siguienteNivel = nivelActual + 1;
    const costo = paseDb.costoDeNivel(siguienteNivel);
    const usuario = db.getUsuario(interaction.user.id);

    if (usuario.balance < costo) {
      return interaction.reply({
        content: `❌ Te faltan ${MONEDA_NOMBRE}. Necesitás **${costo}** ${MONEDA_EMOJI} y tenés **${usuario.balance}**.`,
        ephemeral: true,
      });
    }

    // Cobrar el costo del nivel
    db.addBalance(interaction.user.id, -costo);

    // Entregar recompensa (Lunas + rol opcional)
    const recompensa = paseDb.recompensaDeNivel(siguienteNivel);
    const nuevoBalance = db.addBalance(interaction.user.id, recompensa.lunas);
    paseDb.setNivelUsuario(interaction.user.id, siguienteNivel);

    let descripcion = `¡Subiste al **nivel ${siguienteNivel}**! 🎉\n\n`;
    descripcion += `💸 Pagaste: **${costo}** ${MONEDA_NOMBRE}\n`;
    descripcion += `🎁 Recompensa: **+${recompensa.lunas}** ${MONEDA_NOMBRE}\n`;
    descripcion += `💰 Saldo actual: **${nuevoBalance}** ${MONEDA_NOMBRE}`;

    let rolOtorgado = false;
    if (recompensa.rolId) {
      try {
        await interaction.member.roles.add(recompensa.rolId);
        descripcion += `\n🏅 ¡Ganaste el rol <@&${recompensa.rolId}>!`;
        rolOtorgado = true;
      } catch (err) {
        descripcion += `\n⚠️ Este nivel otorga un rol especial, pero no se pudo asignar automáticamente (revisá que el rol del bot esté por encima de ese rol en la lista de roles del server).`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR_ACENTO)
      .setTitle('🛡️ Pase Doomsday')
      .setDescription(descripcion);

    await interaction.reply({ embeds: [embed] });
  },
};
