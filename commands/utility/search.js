const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'search',
  description: 'Search the web',
  aliases: ['google'],
  async execute(message, args) {
    const query = args.join(' ');
    if (!query) return message.reply('What do you want to search?');

    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(`Search: ${query}`)
      .setDescription(`[Open results](${url})`)
      .setFooter({ text: 'Google' });

    return message.reply({ embeds: [embed] });
  }
};
