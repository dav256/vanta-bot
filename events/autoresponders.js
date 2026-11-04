const ar = require('../utils/autoresponders');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const responders = ar.get(message.guild.id);
    if (!responders.length) return;

    const content = message.content.toLowerCase();

    for (const r of responders) {
      const match = r.exact
        ? content === r.trigger
        : content.includes(r.trigger);

      if (match) {
        try {
          await message.reply(r.response);
        } catch {
          await message.channel.send(r.response).catch(() => {});
        }
        break;
      }
    }
  });
};
