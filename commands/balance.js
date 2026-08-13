const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription(`Mirá cuántas ${MONEDA_NOMBRE} tenés (o las de otro miembro)`)
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a consultar (opcional)')
        .setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const user = db.getUsuario(target.id);

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .setDescription(`${MONEDA_EMOJI} **${user.balance}** ${MONEDA_NOMBRE}`);

    await interaction.reply({ embeds: [embed] });
  },
};
