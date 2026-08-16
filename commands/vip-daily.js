const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { COLOR_PRINCIPAL, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas
const RECOMPENSA_VIP = 150; // más alta que /daily (50)

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vip-daily')
    .setDescription(`Reclamá tu recompensa diaria VIP de ${MONEDA_NOMBRE} (solo para VIP)`),

  async execute(interaction) {
    const vipRoleId = process.env.VIP_ROLE_ID;

    if (!vipRoleId) {
      return interaction.reply({ content: '❌ El rol VIP todavía no está configurado. Avisale a un admin.', ephemeral: true });
    }

    const tieneVip = interaction.member.roles.cache.has(vipRoleId);
    if (!tieneVip) {
      return interaction.reply({ content: `❌ Este comando es exclusivo para <@&${vipRoleId}>.`, ephemeral: true });
    }

    const user = db.getUsuario(interaction.user.id);
    const ahora = Date.now();
    const restante = COOLDOWN_MS - (ahora - (user.lastVipDaily || 0));

    if (restante > 0) {
      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);
      return interaction.reply({
        content: `⏳ Ya reclamaste tu recompensa VIP diaria. Volvé a intentarlo en **${horas}h ${minutos}m**.`,
        ephemeral: true,
      });
    }

    const nuevoBalance = db.addBalance(interaction.user.id, RECOMPENSA_VIP);
    db.setLastVipDaily(interaction.user.id, ahora);

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setDescription(`👑 ${MONEDA_EMOJI} Reclamaste tu recompensa VIP diaria: **+${RECOMPENSA_VIP} ${MONEDA_NOMBRE}**\nSaldo actual: **${nuevoBalance}** ${MONEDA_NOMBRE}`);

    await interaction.reply({ embeds: [embed] });
  },
};
