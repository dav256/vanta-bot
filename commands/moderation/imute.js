const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const punishments = require('../../utils/punishments');

module.exports = {
  name: 'imute',
  description: 'Image mute a member (prevents uploading images/embeds)',
  aliases: ['imagemute', 'imgmute'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) return message.reply('Please mention a member or provide their ID.');
    if (!member.manageable) return message.reply('I cannot manage this member.');

    const role = message.guild.roles.cache.find(r => r.name === 'Image Muted');
    if (!role) return message.reply('Image Muted role not found. Run setup first.');

    if (member.roles.cache.has(role.id)) return message.reply('Member is already image muted.');

    try {
      await member.roles.add(role, `Image muted by ${message.author.tag} | ${reason}`);

      const data = { user: member.user, moderator: message.author, reason, guild: message.guild };
      const custom = punishments.get(message.guild.id, 'imute');
      const content = custom ? punishments.replace(custom, data) : null;

      const embed = new EmbedBuilder()
        .setColor(0xA0A0A0)
        .setTitle('Member Image Muted')
        .setDescription(content || `${member} can no longer upload images.`)
        .addFields(
          { name: 'Moderator', value: `${message.author}`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      const logs = message.guild.channels.cache.find(c => c.name === 'logs');
      if (logs) logs.send({ embeds: [embed] }).catch(() => {});
    } catch (e) {
      console.error(e);
      message.reply('Failed to image mute.');
    }
  }
};
