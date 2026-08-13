const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lunas-admin')
    .setDescription(`[Admin] Dar o quitar ${MONEDA_NOMBRE} a un miembro`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('dar')
        .setDescription(`Darle ${MONEDA_NOMBRE} a un miembro`)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true).setMinValue(1)))
    .addSubcommand(sub =>
      sub.setName('quitar')
        .setDescription(`Quitarle ${MONEDA_NOMBRE} a un miembro`)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true).setMinValue(1)))
    .addSubcommand(sub =>
      sub.setName('fijar')
        .setDescription(`Fijar el saldo exacto de ${MONEDA_NOMBRE} de un miembro`)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Nuevo saldo').setRequired(true).setMinValue(0))),

  // Rol de admin adicional configurable vía ADMIN_ROLE_ID en .env,
  // por si no querés depender solo del permiso "Gestionar servidor".
  async execute(interaction) {
    const adminRoleId = process.env.ADMIN_ROLE_ID;
    const tienePermiso = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
      || (adminRoleId && interaction.member.roles.cache.has(adminRoleId));

    if (!tienePermiso) {
      return interaction.reply({ content: '❌ No tenés permiso para usar este comando.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('usuario');
    const cantidad = interaction.options.getInteger('cantidad');

    let nuevoBalance;
    let accionTexto;

    if (sub === 'dar') {
      nuevoBalance = db.addBalance(target.id, cantidad);
      accionTexto = `le dio **${cantidad} ${MONEDA_NOMBRE}** a`;
    } else if (sub === 'quitar') {
      nuevoBalance = db.addBalance(target.id, -cantidad);
      accionTexto = `le quitó **${cantidad} ${MONEDA_NOMBRE}** a`;
    } else {
      db.setBalance(target.id, cantidad);
      nuevoBalance = cantidad;
      accionTexto = `fijó el saldo de`;
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setDescription(`${MONEDA_EMOJI} **${interaction.user.username}** ${accionTexto} **${target.username}**\nSaldo actual: **${nuevoBalance}** ${MONEDA_NOMBRE}`);

    await interaction.reply({ embeds: [embed] });
  },
};
