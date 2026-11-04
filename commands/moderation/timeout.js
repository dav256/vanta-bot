const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

function parseDuration(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

module.exports = {
  name: 'timeout',
  description: 'Timeout a member',
  aliases: ['mute'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const durationStr = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!target) return message.reply('Mention a member or provide their ID.');
    const duration = parseDuration(durationStr);
    if (!duration || duration > 28 * 86400000) return message.reply('Provide a valid duration (e.g. 10m, 1h, 1d). Max 28 days.');

    const caseData = cases.create(message.guild.id, 'timeout', target.id, message.author.id, reason, { duration: durationStr });

    try {
      await target.timeout(duration, `${message.author.tag}: ${reason}`);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Case #${caseData.id} — Timeout`)
          .setDescription(`${target.user.tag} has been timed out for **${durationStr}**.\n**Reason:** ${reason}`)]
      });
    } catch {
      return message.reply('Failed to timeout the member.');
    }
  }
};
