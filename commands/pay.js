const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription(`Transferile ${MONEDA_NOMBRE} a otro miembro`)
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('A quién le transferís')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('cantidad')
        .setDescription('Cuántas Lunas transferís')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const cantidad = interaction.options.getInteger('cantidad');

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ No podés transferirte Lunas a vos mismo.', ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: '❌ No podés transferirle Lunas a un bot.', ephemeral: true });
    }

    const emisor = db.getUsuario(interaction.user.id);
    if (emisor.balance < cantidad) {
      return interaction.reply({
        content: `❌ No tenés suficientes ${MONEDA_NOMBRE}. Tu saldo: **${emisor.balance}** ${MONEDA_EMOJI}`,
        ephemeral: true,
      });
    }

    db.addBalance(interaction.user.id, -cantidad);
    db.addBalance(target.id, cantidad);

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setDescription(`${MONEDA_EMOJI} **${interaction.user.username}** le transfirió **${cantidad} ${MONEDA_NOMBRE}** a **${target.username}**`);

    await interaction.reply({ embeds: [embed] });
  },
};
