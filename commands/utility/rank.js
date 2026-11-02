const { emoji } = require('../../utils/emojis');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/levels.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function xpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

module.exports = {
  name: 'rank',
  description: 'Check your level and XP',
  aliases: ['level', 'xp'],
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const data = getData();
    const guildId = message.guild.id;
    const userData = data[guildId]?.[target.id] || { xp: 0, level: 0 };

    const needed = xpForLevel(userData.level);
    const progress = Math.min(userData.xp / needed, 1);
    const bar = '█'.repeat(Math.round(progress * 10)) + '░'.repeat(10 - Math.round(progress * 10));

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle(`${emoji('stats')} ${target.tag}'s Rank`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Level', value: String(userData.level), inline: true },
          { name: 'XP', value: `${userData.xp} / ${needed}`, inline: true },
          { name: 'Progress', value: bar }
        )]
    });
  }
};
