const { emoji } = require('../../utils/emojis');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'warn',
  description: 'Warn a member',
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) return message.reply('Mention a member or provide their ID.');

    const caseData = cases.create(message.guild.id, 'warn', target.id, message.author.id, reason);

    try {
      await target.send(`You were warned in **${message.guild.name}**.\n**Reason:** ${reason}`).catch(() => {});
    } catch {}

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle(`${emoji('warn')} Case #${caseData.id} — Warn`)
        .setDescription(`${target.user.tag} has been warned.\n**Reason:** ${reason}`)]
    });
  }
};
