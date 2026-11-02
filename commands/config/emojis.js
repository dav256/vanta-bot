module.exports = {
  name: 'emojis',
  description: 'List all server emojis',
  aliases: ['emojilist', 'emoji'],
  async execute(message) {
    const emojis = message.guild.emojis.cache;
    if (!emojis.size) return message.reply('No custom emojis in this server.');

    const list = emojis.map(e => `${e.toString()} \`${e.name}\` → \`${e.toString()}\``).join('\n');

    // Split if too long
    if (list.length > 1900) {
      const chunks = list.match(/[\s\S]{1,1900}/g) || [];
      for (const chunk of chunks) {
        await message.channel.send(chunk);
      }
    } else {
      await message.reply(list);
    }
  }
};
