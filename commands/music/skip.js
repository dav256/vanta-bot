const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'skip',
  description: 'Skip the current track',
  aliases: ['s', 'next'],
  async execute(message) {
    if (!message.member?.voice?.channel) return message.reply('Join voice first.');
    const ok = music.skip(message.guild.id);
    return message.reply(ok ? 'Skipped.' : 'Nothing is playing.');
  }
};
