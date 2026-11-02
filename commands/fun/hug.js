const { EmbedBuilder } = require('discord.js');

const gifs = [
  'https://media.tenor.com/hug1.gif',
  'https://media.tenor.com/hug2.gif',
  'https://media.tenor.com/hug3.gif'
];

module.exports = {
  name: 'hug',
  description: 'Hug someone',
  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention someone to hug!');

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setDescription(`${message.author} hugs ${target}!`)
      .setImage(gif);

    return message.reply({ embeds: [embed] });
  }
};
