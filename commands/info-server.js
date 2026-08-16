const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info-server')
    .setDescription('Ver información general del servidor'),

  async execute(interaction) {
    const guild = interaction.guild;
    const miembros = guild.memberCount;
    const canalesTexto = guild.channels.cache.filter(c => c.type === 0).size;
    const canalesVoz = guild.channels.cache.filter(c => c.type === 2).size;
    const roles = guild.roles.cache.size;
    const creado = `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`;

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setTitle(`🌑 ${guild.name}`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '👥 Miembros', value: `${miembros}`, inline: true },
        { name: '💬 Canales de texto', value: `${canalesTexto}`, inline: true },
        { name: '🔊 Canales de voz', value: `${canalesVoz}`, inline: true },
        { name: '🏷️ Roles', value: `${roles}`, inline: true },
        { name: '📅 Creado el', value: creado, inline: true },
        { name: '🆔 ID del servidor', value: `\`${guild.id}\``, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
