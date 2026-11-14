const { EmbedBuilder } = require('discord.js');
const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'play',
  description: 'Play a track or stream URL in voice',
  aliases: ['p'],
  async execute(message, args) {
    const query = args.join(' ').trim();
    if (!query) {
      return message.reply('Usage: `play <url>` \u2014 direct stream/mp3 URL works best.');
    }

    const voice = message.member?.voice?.channel;
    if (!voice) return message.reply('Join a voice channel first.');

    const me = message.guild.members.me;
    if (!voice.permissionsFor(me)?.has(['Connect', 'Speak'])) {
      return message.reply('I need **Connect** and **Speak** in that channel.');
    }

    try {
      await music.connect(voice, message.channel);

      if (/^https?:\/\//i.test(query)) {
        music.enqueue(message.guild.id, {
          title: query.split('/').pop().slice(0, 80) || 'Track',
          url: query,
          requestedBy: message.author.tag
        });
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle('Queued')
            .setDescription(`Added to queue: \`${query.slice(0, 100)}\``)]
        });
      }

      return message.reply(
        'For now use a **direct audio URL** (mp3/aac/stream).\n' +
        'Or use `radio start` for 24/7 streams.'
      );
    } catch (err) {
      console.error('[play]', err);
      return message.reply(`Could not play: ${err.message}`);
    }
  }
};
