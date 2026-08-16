require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ Conectado como ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'La Recaída 🌑' }],
    status: 'online',
  });

  // Cada 1 minuto, sumar XP a quienes estén en canales de voz (sin contar bots ni el canal AFK)
  setInterval(async () => {
    const guildId = process.env.GUILD_ID;
    if (!guildId) return;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const nivelesDb = require('./nivelesdb');
    const config = nivelesDb.getConfig();
    if (!config.xpPorMinutoVoz) return;

    const canalAfkId = guild.afkChannelId;

    guild.channels.cache.forEach(canal => {
      if (canal.type !== 2) return; // solo canales de voz
      if (canal.id === canalAfkId) return;

      canal.members.forEach(async member => {
        if (member.user.bot) return;
        const resultado = nivelesDb.agregarXP(member.id, config.xpPorMinutoVoz);
        if (resultado.subioDeNivel) await anunciarSubidaDeNivel(member, resultado.nuevoNivel);
      });
    });
  }, 60 * 1000);
});

async function anunciarSubidaDeNivel(member, nuevoNivel) {
  const nivelesDb = require('./nivelesdb');
  const config = nivelesDb.getConfig();
  const rolId = config.recompensasPorNivel[nuevoNivel];

  if (rolId) {
    try {
      await member.roles.add(rolId);
    } catch (err) {
      console.error(`Error asignando rol de nivel ${nuevoNivel}:`, err);
    }
  }
}

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  const nivelesDb = require('./nivelesdb');
  const config = nivelesDb.getConfig();
  const usuario = nivelesDb.getUsuario(message.author.id);

  const ahora = Date.now();
  const cooldownMs = config.cooldownMensajeSegundos * 1000;
  if (ahora - (usuario.ultimoMensajeXP || 0) < cooldownMs) return;

  const xpGanada = Math.floor(Math.random() * (config.xpMensajeMax - config.xpMensajeMin + 1)) + config.xpMensajeMin;
  const resultado = nivelesDb.agregarXP(message.author.id, xpGanada);
  nivelesDb.guardarUsuario(message.author.id, { ultimoMensajeXP: ahora });

  if (resultado.subioDeNivel) {
    try {
      const member = await message.guild.members.fetch(message.author.id);
      await anunciarSubidaDeNivel(member, resultado.nuevoNivel);
      await message.channel.send(`🎉 <@${message.author.id}> subió al **nivel ${resultado.nuevoNivel}**!`);
    } catch (err) {
      console.error('Error procesando subida de nivel:', err);
    }
  }
});

client.on('guildMemberAdd', async member => {
  // Asignar el rol automático (independiente de la bienvenida)
  const rolAutoId = process.env.AUTO_ROLE_ID;
  if (rolAutoId) {
    try {
      await member.roles.add(rolAutoId);
    } catch (err) {
      console.error('Error asignando el rol automático:', err);
    }
  }

  // Mandar el mensaje de bienvenida
  const canalId = process.env.WELCOME_CHANNEL_ID;
  const imagenUrl = process.env.WELCOME_IMAGE_URL;

  if (!canalId) return; // bienvenida no configurada, no hace nada

  try {
    const canal = await member.guild.channels.fetch(canalId);
    if (!canal || !canal.isTextBased()) return;

    const { EmbedBuilder } = require('discord.js');
    const { COLOR_PRINCIPAL } = require('./theme');

    const fechaIngreso = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());

    const descripcion =
      `¡Bienvenid@! <@${member.id}>\n\n` +
      `**¡Bienvenid@!** 🎉\n` +
      `Esperamos que disfrutes tu estadía en **La Recaída**.\n` +
      `Eres nuestro usuario: **${member.guild.memberCount}**\n` +
      `Fecha de ingreso: ${fechaIngreso}`;

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRINCIPAL)
      .setThumbnail(member.displayAvatarURL())
      .setDescription(descripcion);

    if (imagenUrl) embed.setImage(imagenUrl);

    await canal.send({ content: `<@${member.id}>`, embeds: [embed] });
  } catch (err) {
    console.error('Error enviando bienvenida:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error ejecutando /${interaction.commandName}:`, error);
    const respuesta = { content: '❌ Hubo un error al ejecutar el comando.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(respuesta);
    } else {
      await interaction.reply(respuesta);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
