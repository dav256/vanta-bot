const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/slap1.gif',
  'https://media.tenor.com/slap2.gif',
  'https://media.tenor.com/slap3.gif'
];

module.exports = {
  name: 'slap',
  description: 'Slap someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to slap.');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setDescription(`${message.author} slapped ${target}!`)
        .setImage(gif)]
    });
  }
};
