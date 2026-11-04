const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'View user information',
  aliases: ['ui', 'whois'],
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
        { name: 'Roles', value: member ? member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString()).slice(0, 10).join(' ') || 'None' : 'N/A', inline: false }
      )
      .setFooter({ text: 'User Info' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
