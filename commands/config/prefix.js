const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/prefix.json');

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
  name: 'prefix',
  description: 'Change the bot prefix for this server',
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const newPrefix = args[0];
    if (!newPrefix) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('settings')} Prefix`)
          .setDescription('Usage: !prefix ! or !prefix ,')]
      });
    }

    const data = getData();
    data[message.guild.id] = newPrefix;
    saveData(data);

    return message.reply('Prefix set to ' + newPrefix);
  }
};
