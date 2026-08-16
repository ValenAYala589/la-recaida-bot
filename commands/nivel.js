const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const nivelesDb = require('../nivelesdb');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nivel')
    .setDescription('Ver tu nivel y progreso de XP (o el de otro miembro)')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuario a consultar (opcional)')
        .setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const config = nivelesDb.getConfig();
    const usuario = nivelesDb.getUsuario(target.id);
    const nivelActual = usuario.nivel || 0;
    const xpActual = usuario.xp || 0;

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .setTitle('📈 Nivel');

    if (nivelActual >= config.nivelMaximo) {
      embed.setDescription(`Nivel **${nivelActual}** (máximo) 🏆\nXP total: **${xpActual}**`);
      return interaction.reply({ embeds: [embed] });
    }

    const xpNivelActual = nivelesDb.xpTotalParaNivel(nivelActual);
    const xpProximoNivel = nivelesDb.xpTotalParaNivel(nivelActual + 1);
    const xpEnEsteNivel = xpActual - xpNivelActual;
    const xpNecesaria = xpProximoNivel - xpNivelActual;

    embed.setDescription(
      `**Nivel ${nivelActual}**\n` +
      `XP: ${xpEnEsteNivel} / ${xpNecesaria} (para nivel ${nivelActual + 1})\n` +
      `XP total acumulada: ${xpActual}`
    );

    await interaction.reply({ embeds: [embed] });
  },
};
