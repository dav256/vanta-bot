const { EmbedBuilder } = require('discord.js');
const music = require('../../utils/musicPlayer');

module.exports = {
  name: 'queue',
  description: 'Show or clear the music queue',
  aliases: ['q'],
  async execute(message, args) {
    const session = music.getSession(message.guild.id);
    const sub = args[0]?.toLowerCase();

    if (sub === 'clear' || sub === 'empty') {
      if (session) session.queue = [];
      return message.reply('Queue cleared.');
    }

    if (!session || (!session.current && !session.queue.length)) {
      return message.reply('Queue is empty.');
    }

    const lines = [];
    if (session.current) {
      lines.push(`**Now:** ${session.current.title}${session.current.radio ? ' (24/7)' : ''}`);
    }
    session.queue.slice(0, 15).forEach((t, i) => {
      lines.push(`\`${i + 1}.\` ${t.title}`);
    });
    if (session.queue.length > 15) lines.push(`\u2026and ${session.queue.length - 15} more`);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Queue')
        .setDescription(lines.join('\n'))]
    });
  }
};
