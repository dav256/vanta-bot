const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/welcome.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'welcome',
  description: 'Set welcome channel and message',
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const data = getData();
    const guildId = message.guild.id;

    if (!data[guildId]) data[guildId] = {};

    if (sub === 'channel') {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('Mention a channel.');
      data[guildId].channel = channel.id;
      saveData(data);
      return message.reply(`Welcome channel set to ${channel}.`);
    }

    if (sub === 'message') {
      const text = args.slice(1).join(' ');
      if (!text) return message.reply('Provide a welcome message. Supports {user}, {guild}, {count}.');
      data[guildId].message = text;
      saveData(data);
      return message.reply('Welcome message set.');
    }

    return message.reply('Usage: `!welcome channel #channel` or `!welcome message Your message here`');
  }
};
