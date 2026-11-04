const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'purgeupto',
  description: 'Purge messages up to a replied message',
  aliases: ['purgeup', 'pu'],
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const replied = message.reference;
    if (!replied) return message.reply('Reply to a message to purge up to it.');

    const target = await message.channel.messages.fetch(replied.messageId).catch(() => null);
    if (!target) return message.reply('Could not find the message.');

    const messages = await message.channel.messages.fetch({ limit: 100, after: target.id });
    const toDelete = messages.filter(m => m.createdTimestamp > target.createdTimestamp && m.id !== message.id);

    if (!toDelete.size) return message.reply('No messages to delete.');

    const deleted = await message.channel.bulkDelete(toDelete, true).catch(() => null);
    const count = deleted?.size || 0;

    const reply = await message.reply(`Deleted ${count} message${count !== 1 ? 's' : ''}.`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  }
};
