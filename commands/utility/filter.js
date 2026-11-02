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
          .setTitle('🚫 Filters / Automod')
          .setDescription(
            '`!filter add word` — Block a word\n' +
            '`!filter remove word` — Unblock a word\n' +
            '`!filter links on/off` — Toggle link blocking\n' +
            '`!filter caps on/off` — Toggle excessive caps\n' +
            '`!filter list` — Show settings'
          )]
      });
    }

    if (sub === 'add') {
      const word = args.slice(1).join(' ').toLowerCase();
      if (!word) return message.reply('Provide a word.');
      if (!data[guildId].words.includes(word)) data[guildId].words.push(word);
      saveData(data);
      return message.reply(`✅ Blocked \