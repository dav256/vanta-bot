const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/filters.json');

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
  name: 'filter',
  description: 'Manage word filters and automod',
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = { words: [], links: false, caps: false };

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('Filters')
          .setDescription('!filter add word\n!filter remove word\n!filter links on/off\n!filter caps on/off\n!filter list')]
      });
    }

    if (sub === 'add') {
      const word = args.slice(1).join(' ').toLowerCase();
      if (!word) return message.reply('Provide a word.');
      if (!data[guildId].words.includes(word)) data[guildId].words.push(word);
      saveData(data);
      return message.reply('Blocked ' + word);
    }

    if (sub === 'remove') {
      const word = args.slice(1).join(' ').toLowerCase();
      data[guildId].words = data[guildId].words.filter(w => w !== word);
      saveData(data);
      return message.reply('Removed ' + word);
    }

    if (sub === 'links') {
      data[guildId].links = args[1] === 'on';
      saveData(data);
      return message.reply('Link filter: ' + (data[guildId].links ? 'on' : 'off'));
    }

    if (sub === 'caps') {
      data[guildId].caps = args[1] === 'on';
      saveData(data);
      return message.reply('Caps filter: ' + (data[guildId].caps ? 'on' : 'off'));
    }

    if (sub === 'list') {
      const c = data[guildId];
      return message.reply('Words: ' + (c.words.join(', ') || 'none') + '\nLinks: ' + c.links + '\nCaps: ' + c.caps);
    }

    return message.reply('Use !filter help');
  }
};
