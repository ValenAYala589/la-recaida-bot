const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');
const { COLOR_ACENTO, MONEDA_NOMBRE, MONEDA_EMOJI } = require('../theme');

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hora
const MIN_PAGO = 10;
const MAX_PAGO = 40;

const FRASES = [
  'Vendiste pociones de luna a los novatos del server 🌙',
  'Ayudaste a moderar el chat y te ganaste una propina 🔨',
  'Craftear diamantes en CritCraft te dejó unas monedas extra ⛏️',
  'Ganaste un torneo relámpago en el lobby de voz 🎮',
  'Reclutaste a un nuevo miembro para La Recaída 📌',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription(`Trabajá para ganar ${MONEDA_NOMBRE}`),

  async execute(interaction) {
    const user = db.getUsuario(interaction.user.id);
    const ahora = Date.now();
    const restante = COOLDOWN_MS - (ahora - user.lastWork);

    if (restante > 0) {
      const minutos = Math.ceil(restante / 60000);
      return interaction.reply({
        content: `⏳ Estás cansado. Podés volver a trabajar en **${minutos} min**.`,
        ephemeral: true,
      });
    }

    const pago = Math.floor(Math.random() * (MAX_PAGO - MIN_PAGO + 1)) + MIN_PAGO;
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
    const nuevoBalance = db.addBalance(interaction.user.id, pago);
    db.setLastWork(interaction.user.id, ahora);

    const embed = new EmbedBuilder()
      .setColor(COLOR_ACENTO)
      .setDescription(`${frase}\n${MONEDA_EMOJI} Ganaste **+${pago} ${MONEDA_NOMBRE}**\nSaldo actual: **${nuevoBalance}** ${MONEDA_NOMBRE}`);

    await interaction.reply({ embeds: [embed] });
  },
};
