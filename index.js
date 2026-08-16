require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
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
});

client.on('guildMemberAdd', async member => {
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
