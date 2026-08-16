const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info-usuario')
    .setDescription('Ver información de un miembro del servidor')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a consultar (por defecto: vos)')
        .setRequired(false)),

  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user;
    const member = await interaction.guild.members.fetch(usuario.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '❌ No pude encontrar a ese usuario en el servidor.', ephemeral: true });
    }

    const cuentaCreada = `<t:${Math.floor(usuario.createdTimestamp / 1000)}:D>`;
    const seUnio = `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`;
    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id) // saca el rol @everyone
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .join(', ') || 'Ninguno';

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setAuthor({ name: usuario.username, iconURL: usuario.displayAvatarURL() })
      .setThumbnail(usuario.displayAvatarURL())
      .addFields(
        { name: '🆔 ID', value: `\`${usuario.id}\``, inline: true },
        { name: '📅 Cuenta creada', value: cuentaCreada, inline: true },
        { name: '📥 Se unió al server', value: seUnio, inline: true },
        { name: `🏷️ Roles (${member.roles.cache.size - 1})`, value: roles },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
