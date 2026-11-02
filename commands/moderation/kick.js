const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'kick',
  description: 'Kick a member',
  permissions: [PermissionFlagsBits.KickMembers],
  async execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) return message.reply('Mention a member or provide their ID.');
    if (!target.kickable) return message.reply('I cannot kick this member.');

    const caseData = cases.create(message.guild.id, 'kick', target.id, message.author.id, reason);

    try {
      await target.kick(`${message.author.tag}: ${reason}`);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`${emoji('kick')} Case #${caseData.id} — Kick`)
          .setDescription(`${target.user.tag} has been kicked.\n**Reason:** ${reason}`)]
      });
    } catch {
      return message.reply('Failed to kick the member.');
    }
  }
};
