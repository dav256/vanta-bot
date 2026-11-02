const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/modlog.json');

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
  name: 'modlog',
  description: 'Set the moderation log channel',
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('modlog')} Mod Log Setup`)
          .setDescription('Usage: `!modlog #channel`\n\nAll bans, kicks, timeouts, jails, and antinuke actions will be logged there.')]
      });
    }

    const data = getData();
    data[message.guild.id] = { channel: channel.id };
    saveData(data);

    return message.reply(`Mod log channel set to ${channel}.`);
  }
};
