const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'giveaways.json');

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

module.exports = {
  name: 'giveawayedit',
  description: 'Edit giveaway settings',
  aliases: ['gedit'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const id = args[1];

    if (sub === 'hidewinners' && id) {
      const data = load();
      if (!data[message.guild.id]) data[message.guild.id] = {};
      if (!data[message.guild.id][id]) data[message.guild.id][id] = {};
      data[message.guild.id][id].hideWinners = !data[message.guild.id][id].hideWinners;
      save(data);
      return message.reply(`Hide winners ${data[message.guild.id][id].hideWinners ? 'enabled' : 'disabled'} for giveaway ${id}.`);
    }

    return message.reply('Usage: `giveawayedit hidewinners <messageId>`');
  }
};
