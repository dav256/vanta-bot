const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'mute',
  description: 'Timeout (mute) a member',
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const duration = args[1] || '10m';
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!target) return message.reply('Mention a member or provide their ID.');

    let ms = 10 * 60 * 1000;
    const match = duration.match(/^(\d+)(m|h|d)?$/i);
    if (match) {
      const num = parseInt(match[1]);
      const unit = (match[2] || 'm').toLowerCase();
      if (unit === 'm') ms = num * 60 * 1000;
      if (unit === 'h') ms = num * 60 * 60 * 1000;
      if (unit === 'd') ms = num * 24 * 60 * 60 * 1000;
    }

    const caseData = cases.create(message.guild.id, 'mute', target.id, message.author.id, reason);

    try {
      await target.timeout(ms, `${message.author.tag}: ${reason}`);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`Case #${caseData.id} — Mute`)
          .setDescription(`${target.user.tag} has been muted for ${duration}.\n**Reason:** ${reason}`)]
      });
    } catch {
      return message.reply('Failed to mute the member.');
    }
  }
};
