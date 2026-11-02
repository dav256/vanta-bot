const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/fakeperms.json');

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
  name: 'fakeperms',
  aliases: ['fp'],
  description: 'Give staff bot command access without Discord permissions',
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args) {
    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = { roles: [] };

    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('lock')} Fake Permissions`)
          .setDescription(
            '`!fakeperms add @role` — Give a role access to mod commands\n' +
            '`!fakeperms remove @role` — Remove access\n' +
            '`!fakeperms list` — Show roles with fake perms'
          )]
      });
    }

    if (sub === 'add') {
      const role = message.mentions.roles.first();
      if (!role) return message.reply('Mention a role.');
      if (!data[guildId].roles.includes(role.id)) data[guildId].roles.push(role.id);
      saveData(data);
      return message.reply(`✅ ${role} can now use moderation commands.`);
    }

    if (sub === 'remove') {
      const role = message.mentions.roles.first();
      if (!role) return message.reply('Mention a role.');
      data[guildId].roles = data[guildId].roles.filter(id => id !== role.id);
      saveData(data);
      return message.reply(`❌ Removed fake perms from ${role}.`);
    }

    if (sub === 'list') {
      const roles = data[guildId].roles.map(id => `<@&${id}>`).join('\n') || 'None';
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('Fake Permission Roles')
          .setDescription(roles)]
      });
    }

    return message.reply('Use `!fakeperms help`.');
  }
};
