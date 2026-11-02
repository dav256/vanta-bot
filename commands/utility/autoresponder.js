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
          .setTitle('Autoresponders')
          .setDescription('!ar add trigger | response\n!ar remove trigger\n!ar list')]
      });
    }

    if (sub === 'add') {
      const rest = args.slice(1).join(' ');
      const parts = rest.split('|');
      const trigger = parts[0]?.trim();
      const response = parts.slice(1).join('|').trim();
      if (!trigger || !response) return message.reply('Usage: !ar add hello | Hi there!');
      data[guildId][trigger.toLowerCase()] = response;
      saveData(data);
      return message.reply('Autoresponder added for ' + trigger);
    }

    if (sub === 'remove') {
      const trigger = args.slice(1).join(' ').toLowerCase();
      delete data[guildId][trigger];
      saveData(data);
      return message.reply('Removed.');
    }

    if (sub === 'list') {
      const list = Object.keys(data[guildId]).join(', ') || 'None';
      return message.reply('Autoresponders: ' + list);
    }

    return message.reply('Use !ar help');
  }
};
