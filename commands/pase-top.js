const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const paseDb = require('../pasedb');
const { COLOR_PRINCIPAL } = require('../theme');

const MEDALLAS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doomsday-top')
    .setDescription('Ranking de niveles del Pase Doomsday'),

  async execute(interaction) {
    const top = paseDb.getTop(10);

    if (top.length === 0) {
      return interaction.reply('Todavía nadie compró niveles del Pase de Batalla.');
    }

    const lineas = await Promise.all(top.map(async (row, i) => {
      const posicion = MEDALLAS[i] || `**${i + 1}.**`;
      let nombre;
      try {
        const member = await interaction.guild.members.fetch(row.userId);
        nombre = member.user.username;
      } catch {
        nombre = `Usuario desconocido (${row.userId})`;
      }
      return `${posicion} ${nombre} — Nivel ${row.nivel}`;
    }));

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle('🛡️ Ranking del Pase Doomsday — La Recaída')
      .setDescription(lineas.join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};
