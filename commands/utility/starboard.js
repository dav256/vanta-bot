const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/starboard.json');

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
  name: 'starboard',
  description: 'Set starboard channel',
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('Mention the starboard channel.');

    const data = getData();
    data[message.guild.id] = { channel: channel.id, threshold: 3 };
    saveData(data);

    return message.reply(`Starboard set to ${channel} (threshold: 3 ⭐).`);
  }
};
