const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'timeout',
  aliases: ['to', 'mute'],
  description: 'Timeout a member',
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const durationStr = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!target) return message.reply('Mention a member or provide their ID.');
    if (!durationStr) return message.reply('Provide a duration (e.g. 10m, 1h, 1d).');

    const ms = parseDuration(durationStr);
    if (!ms) return message.reply('Invalid duration. Use 10m, 1h, 1d, etc.');

    const caseData = cases.create(message.guild.id, 'timeout', target.id, message.author.id, reason, { duration: ms });

    try {
      await target.timeout(ms, `${message.author.tag}: ${reason}`);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`${emoji('timeout')} Case #${caseData.id} — Timeout`)
          .setDescription(`${target.user.tag} has been timed out for ${durationStr}.\n**Reason:** ${reason}`)]
      });
    } catch {
      return message.reply('Failed to timeout the member.');
    }
  }
};

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}
