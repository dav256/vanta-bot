const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const punishments = require('../../utils/punishments');

module.exports = {
  name: 'unmute',
  description: 'Unmute a member',
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) return message.reply('Please mention a member or provide their ID.');

    const mutedRole = message.guild.roles.cache.find(r => r.name === 'Muted');
    if (!mutedRole) return message.reply('Muted role not found.');

    if (!member.roles.cache.has(mutedRole.id)) {
      return message.reply('Member is not muted.');
    }

    try {
      await member.roles.remove(mutedRole, `Unmuted by ${message.author.tag} | ${reason}`);

      const data = {
        user: member.user,
        moderator: message.author,
        reason,
        guild: message.guild
      };

      const custom = punishments.get(message.guild.id, 'unmute');
      const content = custom ? punishments.replace(custom, data) : null;

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Member Unmuted')
        .setDescription(content || `${member} has been unmuted.`)
        .addFields(
          { name: 'Moderator', value: `${message.author}`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      const logsChannel = message.guild.channels.cache.find(c => c.name === 'logs');
      if (logsChannel) logsChannel.send({ embeds: [embed] }).catch(() => {});

    } catch (error) {
      console.error(error);
      message.reply('Failed to unmute member.');
    }
  }
};
