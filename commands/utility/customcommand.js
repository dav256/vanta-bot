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
          .setTitle('Custom Commands')
          .setDescription('!cc add name | response\n!cc remove name\n!cc list')]
      });
    }

    if (sub === 'add') {
      const rest = args.slice(1).join(' ');
      const parts = rest.split('|');
      const name = parts[0]?.trim();
      const response = parts.slice(1).join('|').trim();
      if (!name || !response) return message.reply('Usage: !cc add rules | Check the rules channel!');
      data[guildId][name.toLowerCase()] = response;
      saveData(data);
      return message.reply('Custom command added: ' + name);
    }

    if (sub === 'remove') {
      const name = args.slice(1).join(' ').toLowerCase();
      delete data[guildId][name];
      saveData(data);
      return message.reply('Removed.');
    }

    if (sub === 'list') {
      const list = Object.keys(data[guildId]).join(', ') || 'None';
      return message.reply('Custom commands: ' + list);
    }

    return message.reply('Use !cc help');
  }
};
