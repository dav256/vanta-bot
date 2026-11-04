const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'iunmute',
  description: 'Remove image mute from a member',
  aliases: ['imageunmute'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) return message.reply('Please mention a member or provide their ID.');

    const role = message.guild.roles.cache.find(r => r.name === 'Image Muted');
    if (!role) return message.reply('Image Muted role not found.');

    if (!member.roles.cache.has(role.id)) return message.reply('Member is not image muted.');

    try {
      await member.roles.remove(role, `Image unmuted by ${message.author.tag} | ${reason}`);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('Member Image Unmuted')
        .setDescription(`${member} can upload images again.`)
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
      message.reply('Failed to remove image mute.');
    }
  }
};
