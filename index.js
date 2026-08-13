require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
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
