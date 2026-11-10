const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Delete a number of messages (1-100)',
  aliases: ['clear', 'prune'],
  permissions: [PermissionFlagsBits.ManageMessages],
  async execute(message, args) {
    const amount = args.map(a => parseInt(a, 10)).find(n => !isNaN(n) && n >= 1);
    if (!amount || amount > 100) {
      return message.reply('Usage: `purge <1-100>` \u00b7 `purge 50` \u00b7 `purge 20 @user` \u00b7 `purge bots 30`');
    }

    const filterUser = message.mentions?.users?.first?.() || null;
    const botsOnly = args.some(a => String(a).toLowerCase() === 'bots');

    const me = message.guild?.members?.me;
    if (me && !me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('I need **Manage Messages** to purge.');
    }

    try {
      const fetched = await message.channel.messages.fetch({ limit: 100 });
      let list = [...fetched.values()];

      if (message.id) {
        list = list.filter(m => m.id !== message.id);
      }

      const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
      list = list.filter(m => m.createdTimestamp > twoWeeks);

      if (filterUser) {
        list = list.filter(m => m.author.id === filterUser.id);
      } else if (botsOnly) {
        list = list.filter(m => m.author.bot);
      }

      list = list.slice(0, amount);

      if (!list.length) {
        return message.reply(
          'Nothing to delete. Messages may be older than 14 days (Discord limit), or none matched the filter.'
        );
      }

      const deleted = await message.channel.bulkDelete(list, true);
      const count = deleted.size;

      const reply = await message.reply(`Deleted **${count}** message${count !== 1 ? 's' : ''}.`);
      setTimeout(() => {
        if (reply?.delete) reply.delete().catch(() => {});
      }, 4000);
    } catch (err) {
      console.error('[purge]', err);
      return message.reply(
        `Purge failed: ${err.message || 'unknown error'}. I need **Manage Messages**, and messages must be under 14 days old.`
      );
    }
  }
};
