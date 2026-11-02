const { emoji } = require('../utils/emojis');
const wf = require('../utils/wordfilter');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot || message.member?.permissions.has('ManageMessages')) return;

    const words = wf.get(message.guild.id);
    if (!words.length) return;

    const content = message.content.toLowerCase();
    const found = words.some(w => content.includes(w));

    if (found) {
      await message.delete().catch(() => {});
      await message.channel.send(`${emoji('blocked')} ${message.author}, that word is not allowed.`).then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }
  });
};
