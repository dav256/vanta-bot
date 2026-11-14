const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'stop',
  description: 'Stop music and leave voice',
  aliases: ['leave', 'dc'],
  async execute(message) {
    music.stop(message.guild.id);
    return message.reply('Stopped and left the voice channel.');
  }
};
