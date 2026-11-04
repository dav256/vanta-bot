const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'npcs.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;

    const npcs = load()[message.guild.id];
    if (!npcs?.length) return;

    const content = message.content.toLowerCase();

    for (const npc of npcs) {
      if (content.includes(npc.trigger)) {
        try {
          await message.reply(npc.response);
        } catch {
          await message.channel.send(npc.response).catch(() => {});
        }
        break;
      }
    }
  });
};
