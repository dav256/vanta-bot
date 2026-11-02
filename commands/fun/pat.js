const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/pat1.gif',
  'https://media.tenor.com/pat2.gif',
  'https://media.tenor.com/pat3.gif'
];

module.exports = {
  name: 'pat',
  description: 'Pat someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to pat.');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${message.author} patted ${target}!`)
        .setImage(gif)]
    });
  }
};
