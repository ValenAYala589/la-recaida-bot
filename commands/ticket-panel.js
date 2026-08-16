const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('[Admin] Crear el panel para que la gente abra tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName('titulo').setDescription('Título del panel').setRequired(false))
    .addStringOption(opt => opt.setName('descripcion').setDescription('Texto descriptivo del panel').setRequired(false)),

  async execute(interaction) {
    const titulo = interaction.options.getString('titulo') || '🎫 Soporte — La Recaída';
    const descripcion = interaction.options.getString('descripcion')
      || 'Tocá el botón de abajo para abrir un ticket privado con el staff.';

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle(titulo)
      .setDescription(descripcion);

    const boton = new ButtonBuilder()
      .setCustomId('ticket_abrir')
      .setLabel('Abrir Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const fila = new ActionRowBuilder().addComponents(boton);

    await interaction.channel.send({ embeds: [embed], components: [fila] });
    await interaction.reply({ content: '✅ Panel de tickets creado.', ephemeral: true });
  },
};
