const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anuncio')
    .setDescription('[Admin] Publicá un anuncio prolijo en un canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('titulo')
        .setDescription('Título del anuncio')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('mensaje')
        .setDescription('Contenido del anuncio (podés usar \\n para saltos de línea)')
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('canal')
        .setDescription('Canal donde publicarlo (por defecto: este canal)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('mencionar')
        .setDescription('Qué mencionar antes del anuncio')
        .setRequired(false)
        .addChoices(
          { name: '@everyone', value: 'everyone' },
          { name: '@here', value: 'here' },
          { name: 'Ninguno', value: 'none' },
        ))
    .addStringOption(opt =>
      opt.setName('imagen')
        .setDescription('URL de una imagen para el anuncio (opcional)')
        .setRequired(false)),

  async execute(interaction) {
    const titulo = interaction.options.getString('titulo');
    const mensaje = interaction.options.getString('mensaje').replace(/\\n/g, '\n');
    const canal = interaction.options.getChannel('canal') || interaction.channel;
    const mencionar = interaction.options.getString('mencionar');
    const imagen = interaction.options.getString('imagen');

    if (!canal.isTextBased()) {
      return interaction.reply({ content: '❌ Elegí un canal de texto válido.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle(`🌑 ${titulo}`)
      .setDescription(mensaje)
      .setFooter({ text: 'La Recaída', iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    if (imagen) embed.setImage(imagen);

    let contenido = '';
    if (mencionar === 'everyone') contenido = '@everyone';
    if (mencionar === 'here') contenido = '@here';

    await canal.send({ content: contenido || undefined, embeds: [embed] });
    await interaction.reply({ content: `✅ Anuncio publicado en ${canal}.`, ephemeral: true });
  },
};
