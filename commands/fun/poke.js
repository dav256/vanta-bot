const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/poke1.gif',
  'https://media.tenor.com/poke2.gif',
  'https://media.tenor.com/poke3.gif'
];

module.exports = {
  name: 'poke',
  description: 'Poke someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to poke.');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${message.author} poked ${target}!`)
        .setImage(gif)]
    });
  }
};
