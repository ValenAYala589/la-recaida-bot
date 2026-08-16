const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const nivelesDb = require('../nivelesdb');
const { COLOR_PRINCIPAL } = require('../theme');

const MEDALLAS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nivel-top')
    .setDescription('Ranking de niveles del servidor'),

  async execute(interaction) {
    const top = nivelesDb.getTop(10);

    if (top.length === 0) {
      return interaction.reply('Todavía nadie ganó XP en el servidor.');
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
      return `${posicion} ${nombre} — Nivel ${row.nivel} (${row.xp} XP)`;
    }));

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle('📈 Ranking de Niveles — La Recaída')
      .setDescription(lineas.join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};
