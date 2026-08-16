const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const paseDb = require('../pasedb');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doomsday-admin')
    .setDescription('[Admin] Configurar el Pase Doomsday')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('costo')
        .setDescription('Configurar cómo suben los costos de cada nivel')
        .addIntegerOption(opt => opt.setName('base').setDescription(`${MONEDA_NOMBRE} que cuesta el nivel 1`).setRequired(true).setMinValue(1))
        .addIntegerOption(opt => opt.setName('incremento').setDescription(`Cuánto sube el costo por cada nivel`).setRequired(true).setMinValue(0)))
    .addSubcommand(sub =>
      sub.setName('nivel-maximo')
        .setDescription('Configurar el nivel máximo del pase')
        .addIntegerOption(opt => opt.setName('nivel').setDescription('Nivel máximo').setRequired(true).setMinValue(1)))
    .addSubcommand(sub =>
      sub.setName('recompensa')
        .setDescription('Configurar la recompensa de un nivel específico')
        .addIntegerOption(opt => opt.setName('nivel').setDescription('Número de nivel').setRequired(true).setMinValue(1))
        .addIntegerOption(opt => opt.setName('lunas').setDescription(`${MONEDA_NOMBRE} que entrega ese nivel`).setRequired(false).setMinValue(0))
        .addRoleOption(opt => opt.setName('rol').setDescription('Rol que entrega ese nivel (opcional)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('ver-config')
        .setDescription('Ver la configuración actual del pase')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'costo') {
      const base = interaction.options.getInteger('base');
      const incremento = interaction.options.getInteger('incremento');
      paseDb.setConfig({ costoBase: base, costoIncremento: incremento });
      return interaction.reply(`✅ Costos actualizados: nivel 1 cuesta **${base}** ${MONEDA_NOMBRE}, y cada nivel suma **${incremento}** ${MONEDA_NOMBRE} más.`);
    }

    if (sub === 'nivel-maximo') {
      const nivel = interaction.options.getInteger('nivel');
      paseDb.setConfig({ nivelMaximo: nivel });
      return interaction.reply(`✅ Nivel máximo del pase configurado en **${nivel}**.`);
    }

    if (sub === 'recompensa') {
      const nivel = interaction.options.getInteger('nivel');
      const lunas = interaction.options.getInteger('lunas');
      const rol = interaction.options.getRole('rol');
      const guardado = paseDb.setRecompensaNivel(nivel, {
        lunas: lunas !== null ? lunas : undefined,
        rolId: rol ? rol.id : undefined,
      });
      let msg = `✅ Nivel **${nivel}** ahora entrega **${guardado.lunas}** ${MONEDA_EMOJI} ${MONEDA_NOMBRE}`;
      if (guardado.rolId) msg += ` y el rol <@&${guardado.rolId}>`;
      return interaction.reply(msg);
    }

    if (sub === 'ver-config') {
      const config = paseDb.getConfig();
      const embed = new EmbedBuilder()
        .setColor(COLOR_PRINCIPAL)
        .setTitle('🛡️ Configuración del Pase Doomsday')
        .setDescription(
          `**Nivel máximo:** ${config.nivelMaximo}\n` +
          `**Costo nivel 1:** ${config.costoBase} ${MONEDA_NOMBRE}\n` +
          `**Incremento por nivel:** +${config.costoIncremento} ${MONEDA_NOMBRE}\n\n` +
          `**Recompensas especiales configuradas:**\n` +
          (Object.keys(config.recompensasEspeciales).length === 0
            ? 'Ninguna todavía (los niveles sin configurar dan 30% del costo en Lunas, sin rol).'
            : Object.entries(config.recompensasEspeciales)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([nivel, r]) => `Nivel ${nivel}: ${r.lunas} ${MONEDA_NOMBRE}${r.rolId ? ` + <@&${r.rolId}>` : ''}`)
                .join('\n'))
        );
      return interaction.reply({ embeds: [embed] });
    }
  },
};
