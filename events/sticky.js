const sticky = require('../utils/sticky');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const data = sticky.get(message.guild.id, message.channel.id);
    if (!data) return;

    try {
      const old = await message.channel.messages.fetch(data.messageId).catch(() => null);
      if (old) await old.delete().catch(() => {});

      const sent = await message.channel.send({
        embeds: [{ color: 0xFFFFFF, description: data.message }]
      });

      sticky.set(message.guild.id, message.channel.id, data.message, sent.id);
    } catch {}
  });
};
