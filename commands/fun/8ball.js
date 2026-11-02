const { emoji } = require('../../utils/emojis');
const { EmbedBuilder } = require('discord.js');

const responses = [
  'Yes.',
  'No.',
  'Maybe.',
  'Definitely.',
  'Absolutely not.',
  'Ask again later.',
  'It is certain.',
  'Very doubtful.',
  'Outlook good.',
  'Cannot predict now.'
];

module.exports = {
  name: '8ball',
  description: 'Ask the magic 8ball a question',
  aliases: ['eightball', 'magic8ball'],
  async execute(message, args) {
    if (!args.length) return message.reply('Ask a question!');

    const response = responses[Math.floor(Math.random() * responses.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle(`${emoji('fun')} Magic 8Ball`)
        .setDescription(`**Question:** ${args.join(' ')}\n**Answer:** ${response}`)]
    });
  }
};
