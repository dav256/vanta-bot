const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/cuddle1.gif',
  'https://media.tenor.com/cuddle2.gif',
  'https://media.tenor.com/cuddle3.gif'
];

module.exports = {
  name: 'cuddle',
  description: 'Cuddle someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to cuddle.');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${message.author} cuddled ${target}!`)
        .setImage(gif)]
    });
  }
};
