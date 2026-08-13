const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas
const RECOMPENSA = 50;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription(`Reclamá tu recompensa diaria de ${MONEDA_NOMBRE}`),

  async execute(interaction) {
    const user = db.getUsuario(interaction.user.id);
    const ahora = Date.now();
    const restante = COOLDOWN_MS - (ahora - user.lastDaily);

    if (restante > 0) {
      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);
      return interaction.reply({
        content: `⏳ Ya reclamaste tu recompensa diaria. Volvé a intentarlo en **${horas}h ${minutos}m**.`,
        ephemeral: true,
      });
    }

    const nuevoBalance = db.addBalance(interaction.user.id, RECOMPENSA);
    db.setLastDaily(interaction.user.id, ahora);

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setDescription(`${MONEDA_EMOJI} Reclamaste tu recompensa diaria: **+${RECOMPENSA} ${MONEDA_NOMBRE}**\nSaldo actual: **${nuevoBalance}** ${MONEDA_NOMBRE}`);

    await interaction.reply({ embeds: [embed] });
  },
};
