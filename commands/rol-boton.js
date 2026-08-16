const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rol-boton')
    .setDescription('[Admin] Crear un panel de roles autoasignables con botones (hasta 5 roles)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(opt => opt.setName('titulo').setDescription('Título del panel').setRequired(true))
    .addRoleOption(opt => opt.setName('rol1').setDescription('Rol #1').setRequired(true))
    .addStringOption(opt => opt.setName('etiqueta1').setDescription('Texto del botón #1 (opcional, por defecto el nombre del rol)').setRequired(false))
    .addStringOption(opt => opt.setName('emoji1').setDescription('Emoji del botón #1 (opcional)').setRequired(false))
    .addRoleOption(opt => opt.setName('rol2').setDescription('Rol #2').setRequired(false))
    .addStringOption(opt => opt.setName('etiqueta2').setDescription('Texto del botón #2').setRequired(false))
    .addStringOption(opt => opt.setName('emoji2').setDescription('Emoji del botón #2').setRequired(false))
    .addRoleOption(opt => opt.setName('rol3').setDescription('Rol #3').setRequired(false))
    .addStringOption(opt => opt.setName('etiqueta3').setDescription('Texto del botón #3').setRequired(false))
    .addStringOption(opt => opt.setName('emoji3').setDescription('Emoji del botón #3').setRequired(false))
    .addRoleOption(opt => opt.setName('rol4').setDescription('Rol #4').setRequired(false))
    .addStringOption(opt => opt.setName('etiqueta4').setDescription('Texto del botón #4').setRequired(false))
    .addStringOption(opt => opt.setName('emoji4').setDescription('Emoji del botón #4').setRequired(false))
    .addRoleOption(opt => opt.setName('rol5').setDescription('Rol #5').setRequired(false))
    .addStringOption(opt => opt.setName('etiqueta5').setDescription('Texto del botón #5').setRequired(false))
    .addStringOption(opt => opt.setName('emoji5').setDescription('Emoji del botón #5').setRequired(false))
    .addStringOption(opt => opt.setName('descripcion').setDescription('Texto descriptivo del panel (opcional)').setRequired(false)),

  async execute(interaction) {
    const titulo = interaction.options.getString('titulo');
    const descripcion = interaction.options.getString('descripcion');

    const botones = [];
    for (let i = 1; i <= 5; i++) {
      const rol = interaction.options.getRole(`rol${i}`);
      if (!rol) continue;
      const etiqueta = interaction.options.getString(`etiqueta${i}`) || rol.name;
      const emoji = interaction.options.getString(`emoji${i}`);

      const boton = new ButtonBuilder()
        .setCustomId(`rolbtn_${rol.id}`)
        .setLabel(etiqueta)
        .setStyle(ButtonStyle.Secondary);

      if (emoji) boton.setEmoji(emoji);
      botones.push(boton);
    }

    if (botones.length === 0) {
      return interaction.reply({ content: '❌ Necesitás configurar al menos un rol.', ephemeral: true });
    }

    const fila = new ActionRowBuilder().addComponents(botones);

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle(`🏷️ ${titulo}`)
      .setDescription(descripcion || 'Tocá un botón para darte (o sacarte) ese rol.');

    await interaction.channel.send({ embeds: [embed], components: [fila] });
    await interaction.reply({ content: '✅ Panel de roles creado.', ephemeral: true });
  },
};
