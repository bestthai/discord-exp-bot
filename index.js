require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes, Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

const removeExpireBuff = require('./database/utility/buff/removeExpireBuff');

const commands = [];

const deployCommands = async () => {
    try {
        console.log(`Started refreshing ${commands.length} application slash commands in global server`);

        const rest = new REST().setToken(token);

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log('Successfully reloaded all commands');
    } catch (error) {
        console.log('ERROR deploying commands:', error);
    }
};

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

client.commands = new Collection();

const commandsFolder = path.join(__dirname, 'commands');

// Recursive command loader
function loadCommandsRecursive(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            loadCommandsRecursive(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const command = require(fullPath);

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            } else {
                console.log(`WARNING: The command at ${fullPath} is missing a required 'data' or 'execute' property`);
            }
        }
    }
}

loadCommandsRecursive(commandsFolder);

deployCommands();

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

async function startCleanupInterval() {
  try {
    const deleted = await removeExpireBuff(client);
    if (deleted) {
      console.log(`Cleanup: Removed ${deleted} expired buffs.`);
    }
  } catch (error) {
    console.error('Error cleaning expired buffs:', error);
  }
}

// Run cleanup every 30 seconds
setInterval(startCleanupInterval, 30 * 1000);

// Run once immediately on startup
startCleanupInterval();


client.login(token);
