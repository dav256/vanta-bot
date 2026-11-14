const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'pause',
  description: 'Pause playback',
  async execute(message) {
    const ok = music.pause(message.guild.id);
    return message.reply(ok ? 'Paused.' : 'Nothing is playing.');
  }
};
