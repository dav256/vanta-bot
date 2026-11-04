const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const punishments = require('../../utils/punishments');

module.exports = {
  name: 'jail',
  description: 'Jail a member (restrict to #jail channel only)',
  aliases: ['lockup'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) return message.reply('Please mention a member or provide their ID.');
    if (member.id === message.author.id) return message.reply('You cannot jail yourself.');
    if (member.id === client.user.id) return message.reply('I cannot jail myself.');
    if (!member.manageable) return message.reply('I cannot manage this member (role hierarchy).');

    const jailedRole = message.guild.roles.cache.find(r => r.name === 'Jailed');
    if (!jailedRole) return message.reply('Jailed role not found. Run the setup command first.');

    if (member.roles.cache.has(jailedRole.id)) {
      return message.reply('This member is already jailed.');
    }

    try {
      await member.roles.add(jailedRole, `Jailed by ${message.author.tag} | ${reason}`);

      const data = {
        user: member.user,
        moderator: message.author,
        reason,
        guild: message.guild
      };

      const custom = punishments.get(message.guild.id, 'jail');
      let content = custom ? punishments.replace(custom, data) : null;

      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('Member Jailed')
        .setDescription(content || `${member} has been jailed.`)
        .addFields(
          { name: 'Moderator', value: `${message.author}`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setTimestamp();

      await message.reply({ content: content && !custom?.includes('{embed}') ? content : null, embeds: [embed] });

      const logsChannel = message.guild.channels.cache.find(c => c.name === 'logs');
      if (logsChannel) {
        await logsChannel.send({ embeds: [embed] });
      }

      try {
        const dmText = content || `You have been jailed in **${message.guild.name}**.\n**Reason:** ${reason}`;
        await member.send(dmText);
      } catch {}

    } catch (error) {
      console.error(error);
      message.reply('Failed to jail the member.');
    }
  }
};
