const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const messageHandler = require('./handlers/messageHandler');
const slashHandler = require('./handlers/slashHandler');
const path = require('path');
const { loadAppEmojis } = require('./utils/emojis');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel]
});

const PREFIX = process.env.PREFIX || '!';

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const commandsPath = path.join(__dirname, 'commands');
  loadCommands(client, commandsPath);
  // Application emojis (falls back to Unicode if none are uploaded)
  await loadAppEmojis(client);
});

// Safely load event handlers — missing files will not crash the bot
const eventFiles = [
  'antinuke',
  'antiraid',
  'antibot',
  'leveling',
  'messages',
  'filters',
  'starboard',
  'autoresponders',
  'voicemaster',
  'reactionroles',
  'tickets',
  'giveaways',
  'snipe',
  'sticky',
  'wordfilter',
  'welcome'
];

for (const name of eventFiles) {
  try {
    require(`./events/${name}`)(client);
    console.log(`[Events] Loaded: ${name}`);
  } catch (err) {
    console.warn(`[Events] Skipped ${name}: ${err.message}`);
  }
}

messageHandler(client, PREFIX);
slashHandler(client);

client.login(process.env.TOKEN);
