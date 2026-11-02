const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/autoresponders.json');

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
  name: 'autoresponder',
  aliases: ['ar'],
  description: 'Create automatic responses',
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = {};

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('💬 Autoresponders')
          .setDescription(
            '`!ar add trigger | response` — Add one\n' +
            '`!ar remove trigger` — Remove one\n' +
            '`!ar list` — Show all'
          )]
      });
    }

    if (sub === 'add') {
      const rest = args.slice(1).join(' ');
      const [trigger, ...respParts] = rest.split('|');
      const response = respParts.join('|').trim();
      if (!trigger || !response) return message.reply('Usage: `!ar add hello | Hi there!`');
      data[guildId][trigger.trim().toLowerCase()] = response.trim();
      saveData(data);
      return message.reply(`✅ Autoresponder added for \