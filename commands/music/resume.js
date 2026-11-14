const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'resume',
  description: 'Resume playback',
  aliases: ['unpause'],
  async execute(message) {
    const ok = music.resume(message.guild.id);
    return message.reply(ok ? 'Resumed.' : 'Nothing is paused.');
  }
};
