const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const paseDb = require('../pasedb');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doomsday')
    .setDescription('Mirá tu progreso en el Pase Doomsday de La Recaída'),

  async execute(interaction) {
    const config = paseDb.getConfig();
    const nivelActual = paseDb.getNivelUsuario(interaction.user.id);
    const usuario = db.getUsuario(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle('🛡️ Pase Doomsday — La Recaída')
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    if (nivelActual >= config.nivelMaximo) {
      embed.setDescription(`Ya llegaste al **nivel máximo (${config.nivelMaximo})** 🏆\n\nTu saldo: ${MONEDA_EMOJI} **${usuario.balance}** ${MONEDA_NOMBRE}`);
      return interaction.reply({ embeds: [embed] });
    }

    const siguienteNivel = nivelActual + 1;
    const costo = paseDb.costoDeNivel(siguienteNivel);
    const recompensa = paseDb.recompensaDeNivel(siguienteNivel);

    let descripcion = `**Nivel actual:** ${nivelActual} / ${config.nivelMaximo}\n`;
    descripcion += `**Tu saldo:** ${MONEDA_EMOJI} ${usuario.balance} ${MONEDA_NOMBRE}\n\n`;
    descripcion += `**Siguiente nivel (${siguienteNivel})**\n`;
    descripcion += `💸 Costo: **${costo}** ${MONEDA_NOMBRE}\n`;
    descripcion += `🎁 Recompensa: **${recompensa.lunas}** ${MONEDA_NOMBRE}`;
    if (recompensa.rolId) descripcion += ` + rol <@&${recompensa.rolId}>`;
    descripcion += `\n\nUsá \`/doomsday-comprar\` para subir de nivel.`;

    embed.setDescription(descripcion);
    await interaction.reply({ embeds: [embed] });
  },
};
