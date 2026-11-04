const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const punishments = require('../../utils/punishments');

module.exports = {
  name: 'unjail',
  description: 'Remove a member from jail',
  aliases: ['release'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) return message.reply('Please mention a member or provide their ID.');

    const jailedRole = message.guild.roles.cache.find(r => r.name === 'Jailed');
    if (!jailedRole) return message.reply('Jailed role not found. Run the setup command first.');

    if (!member.roles.cache.has(jailedRole.id)) {
      return message.reply('This member is not jailed.');
    }

    try {
      await member.roles.remove(jailedRole, `Unjailed by ${message.author.tag} | ${reason}`);

      const data = {
        user: member.user,
        moderator: message.author,
        reason,
        guild: message.guild
      };

      const custom = punishments.get(message.guild.id, 'unjail');
      const content = custom ? punishments.replace(custom, data) : null;

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Member Unjailed')
        .setDescription(content || `${member} has been released from jail.`)
        .addFields(
          { name: 'Moderator', value: `${message.author}`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      const logsChannel = message.guild.channels.cache.find(c => c.name === 'logs');
      if (logsChannel) {
        await logsChannel.send({ embeds: [embed] });
      }

      try {
        const dmText = content || `You have been released from jail in **${message.guild.name}**.`;
        await member.send(dmText);
      } catch {}

    } catch (error) {
      console.error(error);
      message.reply('Failed to unjail the member.');
    }
  }
};
