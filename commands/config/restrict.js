const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/restrictions.json');

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
  name: 'restrict',
  description: 'Restrict commands to roles',
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = { commands: {} };

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('Command Restrictions')
          .setDescription('!restrict add command @role\n!restrict remove command\n!restrict list')]
      });
    }

    if (sub === 'add') {
      const cmd = args[1]?.toLowerCase();
      const role = message.mentions.roles.first();
      if (!cmd || !role) return message.reply('Usage: !restrict add ban @Moderator');
      data[guildId].commands[cmd] = role.id;
      saveData(data);
      return message.reply('Restricted ' + cmd + ' to ' + role.name);
    }

    if (sub === 'remove') {
      const cmd = args[1]?.toLowerCase();
      delete data[guildId].commands[cmd];
      saveData(data);
      return message.reply('Restriction removed.');
    }

    if (sub === 'list') {
      const list = Object.keys(data[guildId].commands).join(', ') || 'None';
      return message.reply('Restricted: ' + list);
    }

    return message.reply('Use !restrict help');
  }
};
