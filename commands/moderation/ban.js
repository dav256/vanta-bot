const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'ban',
  description: 'Ban a member',
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) return message.reply('Mention a member or provide their ID.');
    if (!target.bannable) return message.reply('I cannot ban this member.');

    const caseData = cases.create(message.guild.id, 'ban', target.id, message.author.id, reason);

    try {
      await target.ban({ reason: `${message.author.tag}: ${reason}` });
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle(`${emoji('ban')} Case #${caseData.id} — Ban`)
          .setDescription(`${target.user.tag} has been banned.\n**Reason:** ${reason}`)]
      });
    } catch {
      return message.reply('Failed to ban the member.');
    }
  }
};
