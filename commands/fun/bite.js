const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/bite1.gif',
  'https://media.tenor.com/bite2.gif',
  'https://media.tenor.com/bite3.gif'
];

module.exports = {
  name: 'bite',
  description: 'Bite someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to bite.');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${message.author} bit ${target}!`)
        .setImage(gif)]
    });
  }
};
