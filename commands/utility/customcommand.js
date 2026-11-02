const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/customcommands.json');

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
  name: 'customcommand',
  aliases: ['cc'],
  description: 'Create server-specific commands',
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = {};

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('⚙️ Custom Commands')
          .setDescription(
            '`!cc add name | response` — Create a command\n' +
            '`!cc remove name` — Delete one\n' +
            '`!cc list` — Show all'
          )]
      });
    }

    if (sub === 'add') {
      const rest = args.slice(1).join(' ');
      const [name, ...respParts] = rest.split('|');
      const response = respParts.join('|').trim();
      if (!name || !response) return message.reply('Usage: `!cc add rules | Check the rules channel!`');
      data[guildId][name.trim().toLowerCase()] = response.trim();
      saveData(data);
      return message.reply(`✅ Custom command \