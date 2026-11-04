const { PermissionFlagsBits } = require('discord.js');
const cases = require('../../utils/cases');

module.exports = {
  name: 'casenote',
  description: 'Add notes to a case',
  aliases: ['note'],
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const id = parseInt(args[0]);
    const note = args.slice(1).join(' ');
    if (!id || !note) return message.reply('Usage: `casenote <id> <note>`');

    const c = cases.get(message.guild.id, id);
    if (!c) return message.reply('Case not found.');

    if (!c.notes) c.notes = [];
    c.notes.push({ text: note, by: message.author.id, at: Date.now() });
    cases.update(message.guild.id, id, c);

    return message.reply(`Note added to case #${id}.`);
  }
};
