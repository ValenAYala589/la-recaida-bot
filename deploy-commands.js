require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos...`);

    // Si hay GUILD_ID, registra solo en ese server (instantáneo, ideal para desarrollo).
    // Si no, registra globalmente (tarda hasta 1 hora en propagarse).
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    const data = await rest.put(route, { body: commands });

    console.log(`✅ ${data.length} comandos registrados correctamente.`);
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
  }
})();
