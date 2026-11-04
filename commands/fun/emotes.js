const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'emotes',
  description: 'Combine two emojis (Emoji Kitchen style)',
  aliases: ['emojikitchen', 'ek'],
  async execute(message, args) {
    const text = args.join(' ');
    const emojis = text.match(/\p{Emoji}/gu) || [];
    if (emojis.length < 2) return message.reply('Provide two emojis. Example: `emotes 😀 🔥`');

    const [a, b] = emojis;
    const url = `https://emojik.vercel.app/s/${encodeURIComponent(a)}_${encodeURIComponent(b)}?size=128`;

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(`${a} + ${b}`)
      .setImage(url)
      .setFooter({ text: 'Emoji Kitchen' });

    return message.reply({ embeds: [embed] });
  }
};
