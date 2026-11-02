const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/antinuke.json');
const actionTracker = new Map();

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

async function logAction(guild, embed) {
  const modlogPath = path.join(__dirname, '../data/modlog.json');
  if (!fs.existsSync(modlogPath)) return;
  const logs = JSON.parse(fs.readFileSync(modlogPath, 'utf8'));
  const channelId = logs[guild.id]?.channel;
  if (!channelId) return;
  const channel = guild.channels.cache.get(channelId);
  if (channel) channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = (client) => {
  const track = async (guild, executorId, action) => {
    const data = getData();
    const cfg = data[guild.id];
    if (!cfg || !cfg.enabled) return;
    if (cfg.whitelist?.includes(executorId)) return;
    if (executorId === client.user.id) return;

    const key = `${guild.id}-${executorId}`;
    const now = Date.now();
    if (!actionTracker.has(key)) actionTracker.set(key, []);
    const times = actionTracker.get(key).filter(t => now - t < 60000);
    times.push(now);
    actionTracker.set(key, times);

    if (times.length >= (cfg.threshold || 5)) {
      const member = await guild.members.fetch(executorId).catch(() => null);
      if (!member) return;

      const reason = `Antinuke: ${times.length} actions in 60s`;
      if (cfg.punishment === 'ban') await member.ban({ reason }).catch(() => {});
      else if (cfg.punishment === 'kick') await member.kick(reason).catch(() => {});
      else await member.timeout(10 * 60 * 1000, reason).catch(() => {});

      actionTracker.delete(key);

      await logAction(guild, new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Antinuke Triggered')
        .setDescription(`${member.user.tag} was ${cfg.punishment}ed for exceeding the action threshold.`)
        .setTimestamp());
    }
  };

  client.on('guildBanAdd', async (ban) => {
    const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (entry && entry.target.id === ban.user.id) track(ban.guild, entry.executor.id, 'ban');
  });

  client.on('guildMemberRemove', async (member) => {
    const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (entry && entry.target.id === member.id && Date.now() - entry.createdTimestamp < 5000) {
      track(member.guild, entry.executor.id, 'kick');
    }
  });

  client.on('channelDelete', async (channel) => {
    const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (entry && Date.now() - entry.createdTimestamp < 5000) track(channel.guild, entry.executor.id, 'channelDelete');
  });

  client.on('roleDelete', async (role) => {
    const logs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (entry && Date.now() - entry.createdTimestamp < 5000) track(role.guild, entry.executor.id, 'roleDelete');
  });

  console.log('[Events] Antinuke loaded');
};
