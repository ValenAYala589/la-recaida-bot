const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

const MEDALLAS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription(`Ranking de los que más ${MONEDA_NOMBRE} tienen en el server`),

  async execute(interaction) {
    const top = db.getLeaderboard(10);

    if (top.length === 0) {
      return interaction.reply('Todavía no hay nadie con Lunas registradas.');
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
      return `${posicion} ${nombre} — ${row.balance} ${MONEDA_EMOJI}`;
    }));

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle(`${MONEDA_EMOJI} Ranking de ${MONEDA_NOMBRE} — La Recaída`)
      .setDescription(lineas.join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};
