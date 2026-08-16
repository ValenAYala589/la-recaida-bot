const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const nivelesDb = require('../nivelesdb');
const { COLOR_PRINCIPAL } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nivel-admin')
    .setDescription('[Admin] Configurar el sistema de niveles/XP')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('recompensa')
        .setDescription('Asignar un rol como recompensa de un nivel')
        .addIntegerOption(opt => opt.setName('nivel').setDescription('Número de nivel').setRequired(true).setMinValue(1))
        .addRoleOption(opt => opt.setName('rol').setDescription('Rol que se entrega en ese nivel').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('xp-mensaje')
        .setDescription('Configurar cuánta XP se gana por mensaje')
        .addIntegerOption(opt => opt.setName('min').setDescription('XP mínima por mensaje').setRequired(true).setMinValue(1))
        .addIntegerOption(opt => opt.setName('max').setDescription('XP máxima por mensaje').setRequired(true).setMinValue(1))
        .addIntegerOption(opt => opt.setName('cooldown-segundos').setDescription('Segundos de espera entre mensajes que dan XP').setRequired(false).setMinValue(1)))
    .addSubcommand(sub =>
      sub.setName('xp-voz')
        .setDescription('Configurar cuánta XP se gana por minuto en un canal de voz')
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('XP por minuto en voz').setRequired(true).setMinValue(0)))
    .addSubcommand(sub =>
      sub.setName('nivel-maximo')
        .setDescription('Configurar el nivel máximo')
        .addIntegerOption(opt => opt.setName('nivel').setDescription('Nivel máximo').setRequired(true).setMinValue(1)))
    .addSubcommand(sub =>
      sub.setName('ver-config')
        .setDescription('Ver la configuración actual del sistema de niveles')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'recompensa') {
      const nivel = interaction.options.getInteger('nivel');
      const rol = interaction.options.getRole('rol');
      nivelesDb.setRecompensaNivel(nivel, rol.id);
      return interaction.reply(`✅ Nivel **${nivel}** ahora entrega el rol <@&${rol.id}>.`);
    }

    if (sub === 'xp-mensaje') {
      const min = interaction.options.getInteger('min');
      const max = interaction.options.getInteger('max');
      const cooldown = interaction.options.getInteger('cooldown-segundos');
      const cambios = { xpMensajeMin: min, xpMensajeMax: max };
      if (cooldown) cambios.cooldownMensajeSegundos = cooldown;
      nivelesDb.setConfig(cambios);
      return interaction.reply(`✅ XP por mensaje configurada: ${min}-${max} XP${cooldown ? `, cooldown de ${cooldown}s` : ''}.`);
    }

    if (sub === 'xp-voz') {
      const cantidad = interaction.options.getInteger('cantidad');
      nivelesDb.setConfig({ xpPorMinutoVoz: cantidad });
      return interaction.reply(`✅ XP por minuto en voz configurada en **${cantidad}**.`);
    }

    if (sub === 'nivel-maximo') {
      const nivel = interaction.options.getInteger('nivel');
      nivelesDb.setConfig({ nivelMaximo: nivel });
      return interaction.reply(`✅ Nivel máximo configurado en **${nivel}**.`);
    }

    if (sub === 'ver-config') {
      const config = nivelesDb.getConfig();
      const embed = new EmbedBuilder()
        .setColor(COLOR_PRINCIPAL)
        .setTitle('⚙️ Configuración del sistema de niveles')
        .setDescription(
          `**Nivel máximo:** ${config.nivelMaximo}\n` +
          `**XP por mensaje:** ${config.xpMensajeMin}-${config.xpMensajeMax} (cooldown ${config.cooldownMensajeSegundos}s)\n` +
          `**XP por minuto en voz:** ${config.xpPorMinutoVoz}\n\n` +
          `**Recompensas de rol configuradas:**\n` +
          (Object.keys(config.recompensasPorNivel).length === 0
            ? 'Ninguna todavía.'
            : Object.entries(config.recompensasPorNivel)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([nivel, rolId]) => `Nivel ${nivel}: <@&${rolId}>`)
                .join('\n'))
        );
      return interaction.reply({ embeds: [embed] });
    }
  },
};
