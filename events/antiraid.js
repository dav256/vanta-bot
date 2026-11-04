const { EmbedBuilder } = require('discord.js');
const security = require('../utils/security');

const joinTracker = new Map();

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const config = security.get(member.guild.id);
    if (!config.antiraid.enabled) return;

    const now = Date.now();

    if (config.antiraid.massJoin.enabled) {
      if (!joinTracker.has(member.guild.id)) joinTracker.set(member.guild.id, []);
      const joins = joinTracker.get(member.guild.id);
      joins.push(now);

      const window = (config.antiraid.massJoin.window || 10) * 1000;
      const recent = joins.filter(t => now - t < window);
      joinTracker.set(member.guild.id, recent);

      if (recent.length >= (config.antiraid.massJoin.threshold || 8)) {
        const punishment = config.antiraid.massJoin.punishment || 'kick';

        try {
          if (punishment === 'ban') await member.ban({ reason: 'Antiraid: Mass join' });
          else if (punishment === 'kick') await member.kick('Antiraid: Mass join');
        } catch {}

        if (config.antiraid.massJoin.lock) {
          const everyone = member.guild.roles.everyone;
          member.guild.channels.cache.forEach(ch => {
            if (ch.isTextBased()) {
              ch.permissionOverwrites.edit(everyone, { SendMessages: false }).catch(() => {});
            }
          });
        }

        const owner = await member.guild.fetchOwner().catch(() => null);
        if (owner) {
          owner.send({
            embeds: [new EmbedBuilder()
              .setColor(0xFF9900)
              .setTitle('Antiraid: Mass Join Detected')
              .setDescription(`${recent.length} joins in ${config.antiraid.massJoin.window}s.\nAction taken on newest member.`)
              .setTimestamp()]
          }).catch(() => {});
        }
      }
    }

    if (config.antiraid.newAccount.enabled) {
      const ageMs = Date.now() - member.user.createdTimestamp;
      const limitDays = config.antiraid.newAccount.age || 7;
      const limitMs = limitDays * 24 * 60 * 60 * 1000;

      if (ageMs < limitMs) {
        const punishment = config.antiraid.newAccount.punishment || 'kick';
        try {
          if (punishment === 'ban') await member.ban({ reason: `Antiraid: Account younger than ${limitDays} days` });
          else if (punishment === 'kick') await member.kick(`Antiraid: Account younger than ${limitDays} days`);
        } catch {}
      }
    }

    if (config.antiraid.noAvatar.enabled && !member.user.avatar) {
      const punishment = config.antiraid.noAvatar.punishment || 'kick';
      try {
        if (punishment === 'ban') await member.ban({ reason: 'Antiraid: No avatar' });
        else if (punishment === 'kick') await member.kick('Antiraid: No avatar');
      } catch {}
    }
  });
};
