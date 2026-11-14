const { EmbedBuilder } = require('discord.js');
const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'nowplaying',
  description: 'Show the current track',
  aliases: ['np', 'fm'],
  async execute(message) {
    const session = music.getSession(message.guild.id);
    if (!session?.current) return message.reply('Nothing is playing.');

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Now Playing')
        .setDescription(`**${session.current.title}**${session.radio ? '\nMode: 24/7 Radio' : ''}`)
        .addFields(
          { name: 'Volume', value: `${session.volume}%`, inline: true },
          { name: 'Queue', value: String(session.queue.length), inline: true }
        )]
    });
  }
};
