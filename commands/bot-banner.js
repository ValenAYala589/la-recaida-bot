const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot-banner')
    .setDescription('[Admin] Cambiar el banner del perfil de El Recaído')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('imagen_url')
        .setDescription('Link directo a la imagen del banner (recomendado: 680x240px o más)')
        .setRequired(true)),

  async execute(interaction) {
    const url = interaction.options.getString('imagen_url');

    try {
      await interaction.client.user.setBanner(url);
      await interaction.reply(`✅ Banner actualizado. Puede tardar un ratito en verse reflejado en el perfil del bot.`);
    } catch (err) {
      console.error('Error actualizando el banner del bot:', err);
      await interaction.reply({
        content: '❌ No se pudo actualizar el banner. Verificá que el link sea directo a una imagen .png o .jpg (no un link de página).',
        ephemeral: true,
      });
    }
  },
};
