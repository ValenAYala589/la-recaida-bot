const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const ticketsDb = require('../ticketsdb');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-admin')
    .setDescription('[Admin] Configurar el sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('Configurar el rol de staff y la categoría de tickets')
        .addRoleOption(opt => opt.setName('staff-rol').setDescription('Rol que puede ver y responder los tickets').setRequired(true))
        .addChannelOption(opt =>
          opt.setName('categoria')
            .setDescription('Categoría donde se crean los tickets normales (opcional)')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false))
        .addChannelOption(opt =>
          opt.setName('categoria-vip')
            .setDescription('Categoría donde se crean los tickets de miembros VIP (opcional)')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('ver-config')
        .setDescription('Ver la configuración actual del sistema de tickets')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'config') {
      const staffRol = interaction.options.getRole('staff-rol');
      const categoria = interaction.options.getChannel('categoria');
      const categoriaVip = interaction.options.getChannel('categoria-vip');
      ticketsDb.setConfig({
        staffRoleId: staffRol.id,
        categoriaId: categoria ? categoria.id : null,
        categoriaVipId: categoriaVip ? categoriaVip.id : null,
      });
      let msg = `✅ Configuración guardada: el rol <@&${staffRol.id}> va a poder ver y responder los tickets.`;
      if (categoria) msg += ` Tickets normales en **${categoria.name}**.`;
      if (categoriaVip) msg += ` Tickets VIP en **${categoriaVip.name}**.`;
      return interaction.reply(msg);
    }

    if (sub === 'ver-config') {
      const config = ticketsDb.getConfig();
      const embed = new EmbedBuilder()
        .setColor(COLOR_PRINCIPAL)
        .setTitle('🎫 Configuración de Tickets')
        .setDescription(
          `**Rol de staff:** ${config.staffRoleId ? `<@&${config.staffRoleId}>` : 'No configurado'}\n` +
          `**Categoría normal:** ${config.categoriaId ? `<#${config.categoriaId}>` : 'Ninguna (se crean fuera de categoría)'}\n` +
          `**Categoría VIP:** ${config.categoriaVipId ? `<#${config.categoriaVipId}>` : 'No configurada (usa la normal)'}\n` +
          `**Tickets creados hasta ahora:** ${config.contador || 0}`
        );
      return interaction.reply({ embeds: [embed] });
    }
  },
};
