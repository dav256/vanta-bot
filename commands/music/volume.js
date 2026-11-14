const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'volume',
  description: 'Set music volume 0-100',
  aliases: ['vol'],
  async execute(message, args) {
    const vol = parseInt(args[0], 10);
    if (isNaN(vol) || vol < 0 || vol > 100) {
      return message.reply('Usage: `volume <0-100>`');
    }
    const set = music.setVolume(message.guild.id, vol);
    return message.reply(`Volume set to **${set}%** (applies on next track/stream).`);
  }
};
