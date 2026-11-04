const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'runmute',
  description: 'Remove reaction mute from a member',
  aliases: ['reactionunmute'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) return message.reply('Please mention a member or provide their ID.');

    const role = message.guild.roles.cache.find(r => r.name === 'Reaction Muted');
    if (!role) return message.reply('Reaction Muted role not found.');

    if (!member.roles.cache.has(role.id)) return message.reply('Member is not reaction muted.');

    try {
      await member.roles.remove(role, `Reaction unmuted by ${message.author.tag} | ${reason}`);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Member Reaction Unmuted')
        .setDescription(`${member} can add reactions again.`)
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
      message.reply('Failed to remove reaction mute.');
    }
  }
};
