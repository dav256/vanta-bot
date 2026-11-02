const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/filters.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.member.permissions.has('ManageMessages')) return;

    const data = getData();
    const cfg = data[message.guild.id];
    if (!cfg) return;

    const content = message.content.toLowerCase();

    for (const word of cfg.words || []) {
      if (content.includes(word)) {
        await message.delete().catch(() => {});
        return message.channel.send(message.author.toString() + ' your message contained a blocked word.').then(m => setTimeout(() => m.delete().catch(() => {}), 3000)).catch(() => {});
      }
    }

    if (cfg.links && /https?:\/\//i.test(message.content)) {
      await message.delete().catch(() => {});
      return message.channel.send(message.author.toString() + ' links are not allowed.').then(m => setTimeout(() => m.delete().catch(() => {}), 3000)).catch(() => {});
    }

    if (cfg.caps && message.content.length > 10 && message.content.replace(/[^A-Z]/g, '').length / message.content.length > 0.7) {
      await message.delete().catch(() => {});
      return message.channel.send(message.author.toString() + ' too many caps.').then(m => setTimeout(() => m.delete().catch(() => {}), 3000)).catch(() => {});
    }
  });

  console.log('[Events] Filters loaded');
};
