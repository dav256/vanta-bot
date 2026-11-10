const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Delete a number of messages',
  aliases: ['clear', 'prune'],
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('Usage: `purge <1-100>` \u00b7 `purge <1-100> @user` \u00b7 `purge bots <1-100>`');
    }

    const filterUser = message.mentions.users.first();
    const botsOnly = args.some(a => a.toLowerCase() === 'bots');

    let messages = await message.channel.messages.fetch({ limit: Math.min(amount + 5, 100) });
    messages = messages.filter(m => m.id !== message.id);

    if (filterUser) {
      messages = messages.filter(m => m.author.id === filterUser.id);
    } else if (botsOnly) {
      messages = messages.filter(m => m.author.bot);
    }

    messages = [...messages.values()].slice(0, amount);

    if (!messages.length) {
      return message.reply('No messages to delete.');
    }

    const deleted = await message.channel.bulkDelete(messages, true).catch(() => null);
    const count = deleted?.size || 0;

    const reply = await message.reply(`Deleted **${count}** message${count !== 1 ? 's' : ''}.`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  }
};
