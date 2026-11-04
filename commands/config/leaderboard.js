const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'leaderboard.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

function save(data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function get(guildId) {
  const data = load();
  return data[guildId] || { messages: {}, voice: {} };
}

function set(guildId, config) {
  const data = load();
  data[guildId] = config;
  save(data);
}

module.exports = {
  name: 'leaderboard',
  description: 'Message and voice leaderboards',
  aliases: ['lb'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Leaderboard')
          .setDescription('Track messages and voice time.')
          .addFields(
            { name: 'Messages', value: '`leaderboard messages`', inline: false },
            { name: 'Voice', value: '`leaderboard voice`', inline: false },
            { name: 'Reset', value: '`leaderboard reset`', inline: false }
          )]
      });
    }

    const config = get(message.guild.id);

    if (sub === 'messages' || sub === 'msg') {
      const sorted = Object.entries(config.messages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      if (!sorted.length) return message.reply('No message data yet.');
      const desc = sorted.map(([id, count], i) => `${i + 1}. <@${id}> — ${count}`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Message Leaderboard').setDescription(desc)]
      });
    }

    if (sub === 'voice') {
      const sorted = Object.entries(config.voice)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      if (!sorted.length) return message.reply('No voice data yet.');
      const desc = sorted.map(([id, mins], i) => `${i + 1}. <@${id}> — ${Math.floor(mins)}m`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Voice Leaderboard').setDescription(desc)]
      });
    }

    if (sub === 'reset') {
      set(message.guild.id, { messages: {}, voice: {} });
      return message.reply('Leaderboard reset.');
    }

    return message.reply('Use `leaderboard help`.');
  }
};
