const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Get a user avatar',
  aliases: ['av', 'pfp'],
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setFooter({ text: 'Avatar' });
    return message.reply({ embeds: [embed] });
  }
};
