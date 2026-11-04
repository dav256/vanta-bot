const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'banner',
  description: 'Get a user banner',
  aliases: ['userbanner'],
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const full = await user.fetch().catch(() => user);
    const banner = full.bannerURL({ size: 512 });
    if (!banner) return message.reply('No banner.');
    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(`${user.username}'s Banner`)
      .setImage(banner)
      .setFooter({ text: 'Banner' });
    return message.reply({ embeds: [embed] });
  }
};
