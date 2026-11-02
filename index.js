const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const messageHandler = require('./handlers/messageHandler');
const slashHandler = require('./handlers/slashHandler');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel]
});

const PREFIX = process.env.PREFIX || '!';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Use absolute path so the host always finds the commands folder
  const commandsPath = path.join(__dirname, 'commands');
  loadCommands(client, commandsPath);
});

// Events
require('./events/antinuke')(client);
require('./events/antiraid')(client);
require('./events/messages')(client);
require('./events/filters')(client);
require('./events/starboard')(client);
require('./events/autoresponders')(client);
require('./events/voicemaster')(client);
require('./events/reactionroles')(client);
require('./events/tickets')(client);
require('./events/giveaways')(client);
require('./events/snipe')(client);
require('./events/sticky')(client);
require('./events/wordfilter')(client);

messageHandler(client, PREFIX);
slashHandler(client);

client.login(process.env.TOKEN);
