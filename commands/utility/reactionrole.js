const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/reactionroles.json');

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
  name: 'reactionrole',
  description: 'Add a reaction role',
  aliases: ['rr'],
  permissions: [PermissionFlagsBits.ManageRoles],
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    const messageId = args[1];
    const emoji = args[2];
    const role = message.mentions.roles.first();

    if (!channel || !messageId || !emoji || !role) {
      return message.reply('Usage: `!rr #channel messageId emoji @role`');
    }

    const data = getData();
    const key = `${channel.id}-${messageId}`;
    if (!data[key]) data[key] = [];
    data[key].push({ emoji, role: role.id });
    saveData(data);

    try {
      const msg = await channel.messages.fetch(messageId);
      await msg.react(emoji);
    } catch {}

    return message.reply(`Reaction role added: ${emoji} → ${role}`);
  }
};
