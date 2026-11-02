const { emoji } = require('../utils/emojis');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/antiraid.json');
const joinTracker = new Map();

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const data = getData();
    const cfg = data[member.guild.id];
    if (!cfg || !cfg.enabled) return;

    const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
    if (cfg.minAccountAge && accountAgeDays < cfg.minAccountAge) {
      if (cfg.action === 'ban') await member.ban({ reason: 'Antiraid: Account too new' }).catch(() => {});
      else await member.kick('Antiraid: Account too new').catch(() => {});
      return;
    }

    const key = member.guild.id;
    const now = Date.now();
    if (!joinTracker.has(key)) joinTracker.set(key, []);
    const joins = joinTracker.get(key).filter(t => now - t < (cfg.timeWindow || 10) * 1000);
    joins.push(now);
    joinTracker.set(key, joins);

    if (joins.length >= (cfg.maxJoins || 5)) {
      if (cfg.action === 'ban') await member.ban({ reason: 'Antiraid: Mass join' }).catch(() => {});
      else await member.kick('Antiraid: Mass join').catch(() => {});

      const channel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(member.guild.members.me).has('SendMessages'));
      if (channel) channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle(`${emoji('warn')} Antiraid Triggered`)
          .setDescription(`${joins.length} joins detected in ${cfg.timeWindow}s. Latest member actioned.`)]
      }).catch(() => {});
    }
  });

  console.log('[Events] Antiraid loaded');
};
