const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/kiss1.gif',
  'https://media.tenor.com/kiss2.gif',
  'https://media.tenor.com/kiss3.gif'
];

module.exports = {
  name: 'kiss',
  description: 'Kiss someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to kiss.');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${message.author} kissed ${target}!`)
        .setImage(gif)]
    });
  }
};
