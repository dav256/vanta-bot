const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'quote',
  description: 'Quote a message',
  aliases: ['q'],
  async execute(message, args) {
    const replied = message.reference;
    if (!replied) return message.reply('Reply to a message to quote it.');

    const target = await message.channel.messages.fetch(replied.messageId).catch(() => null);
    if (!target) return message.reply('Could not find the message.');

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setAuthor({ name: target.author.tag, iconURL: target.author.displayAvatarURL() })
      .setDescription(target.content || '*No text*')
      .setFooter({ text: `#${message.channel.name}` })
      .setTimestamp(target.createdAt);

    if (target.attachments.size) {
      embed.setImage(target.attachments.first().url);
    }

    await message.channel.send({ embeds: [embed] });
  }
};
