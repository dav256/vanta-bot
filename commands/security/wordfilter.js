const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const wf = require('../../utils/wordfilter');

module.exports = {
  name: 'wordfilter',
  description: 'Manage banned words',
  aliases: ['wf', 'filterword'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'list') {
      const words = wf.get(message.guild.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Word Filter')
          .setDescription(words.length ? words.map(w => `\`${w}\``).join(', ') : 'No words filtered.')
          .setFooter({ text: 'wf add <word> | wf remove <word>' })]
      });
    }

    if (sub === 'add') {
      const word = args.slice(1).join(' ');
      if (!word) return message.reply('Provide a word.');
      wf.add(message.guild.id, word);
      return message.reply(`Added \`${word}\` to the filter.`);
    }

    if (sub === 'remove') {
      const word = args.slice(1).join(' ');
      if (!word) return message.reply('Provide a word.');
      const removed = wf.remove(message.guild.id, word);
      return message.reply(removed ? `Removed \`${word}\`.` : 'Word not found.');
    }

    return message.reply('Use `wf list`, `wf add`, or `wf remove`.');
  }
};
