const { EmbedBuilder } = require('discord.js');
const { COLOR_PRINCIPAL } = require('./theme');

function construirEmbedLevelUp(member, nuevoNivel) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PRINCIPAL)
    .setThumbnail(member.displayAvatarURL())
    .setTitle('NUEVO NIVEL')
    .setDescription(
      `🆙 <@${member.id}> ha subido al **nivel ${nuevoNivel}**!\n\n` +
      `Felicidades, ¡sigue así! 🎉`
    );

  const imagenUrl = process.env.LEVEL_UP_IMAGE_URL;
  if (imagenUrl) embed.setImage(imagenUrl);

  return embed;
}

module.exports = construirEmbedLevelUp;
