const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'npcs.json');
const lastActivity = new Map();

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;

    lastActivity.set(message.channel.id, Date.now());

    const npcs = load()[message.guild.id];
    if (!npcs?.length) return;

    const content = message.content.toLowerCase();

    for (const npc of npcs) {
      if (npc.trigger && content.includes(npc.trigger)) {
        const response = npc.responses?.length ? pick(npc.responses) : npc.response;
        if (!response) continue;
        try {
          await message.reply(response);
        } catch {
          await message.channel.send(response).catch(() => {});
        }
        break;
      }
    }
  });

  setInterval(async () => {
    const data = load();
    for (const [guildId, npcs] of Object.entries(data)) {
      if (!npcs?.length) continue;

      for (const npc of npcs) {
        if (npc.reviveChannel) {
          const channel = client.channels.cache.get(npc.reviveChannel);
          if (!channel) continue;

          const last = lastActivity.get(channel.id) || 0;
          const quiet = Date.now() - last > 30 * 60 * 1000;

          if (quiet && Math.random() < 0.3) {
            const msg = npc.responses?.length
              ? pick(npc.responses)
              : `Hey everyone, ${npc.name} checking in. How's everyone doing?`;
            await channel.send(msg).catch(() => {});
            lastActivity.set(channel.id, Date.now());
          }
        }

        if (npc.questions?.length && Math.random() < 0.05) {
          const guild = client.guilds.cache.get(guildId);
          if (!guild) continue;
          const channel = guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('SendMessages'));
          if (!channel) continue;

          const q = pick(npc.questions);
          await channel.send(`**${npc.name}:** ${q}`).catch(() => {});
        }
      }
    }
  }, 5 * 60 * 1000);
};
