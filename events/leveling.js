const { emoji } = require('../utils/emojis');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/levels.json');
const cooldowns = new Map();

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function xpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    if (cooldowns.has(key) && now - cooldowns.get(key) < 60000) return;
    cooldowns.set(key, now);

    const data = getData();
    const guildId = message.guild.id;
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][message.author.id]) data[guildId][message.author.id] = { xp: 0, level: 0 };

    const user = data[guildId][message.author.id];
    user.xp += Math.floor(Math.random() * 15) + 10;

    const needed = xpForLevel(user.level);
    if (user.xp >= needed) {
      user.level += 1;
      user.xp -= needed;

      message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setDescription(`${emoji('level')} ${message.author} leveled up to **Level ${user.level}**!`)]
      }).catch(() => {});
    }

    saveData(data);
  });

  console.log('[Events] Leveling loaded');
};
