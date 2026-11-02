const { EmbedBuilder } = require('discord.js');
const snipe = require('../../events/snipe');

module.exports = {
  name: 'snipe',
  description: 'See the last deleted message',
  async execute(message) {
    const data = snipe.get(message.channel.id);
    if (!data) return message.reply('Nothing to snipe.');

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setAuthor({ name: data.author.tag, iconURL: data.author.displayAvatarURL() })
        .setDescription(data.content || '*No content*')
        .setFooter({ text: `Deleted ${Math.floor((Date.now() - data.timestamp) / 1000)}s ago` })]
    });
  }
};
