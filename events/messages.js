const { Events } = require('discord.js');
const { parseEmbedScript } = require('../utils/scripting');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'messages.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

module.exports = (client) => {
  client.on(Events.GuildMemberAdd, async (member) => {
    const data = load();
    const welcomes = data[member.guild.id]?.welcome;
    if (!welcomes?.length) return;

    for (const config of welcomes) {
      const channel = member.guild.channels.cache.get(config.channel);
      if (!channel) continue;

      const payload = parseEmbedScript(config.script, { user: member.user, guild: member.guild });
      if (!payload) continue;

      try {
        const sent = await channel.send(payload);
        if (config.selfDestruct && config.selfDestruct >= 6 && config.selfDestruct <= 60) {
          setTimeout(() => sent.delete().catch(() => {}), config.selfDestruct * 1000);
        }
      } catch (e) {
        console.error('Welcome send failed:', e);
      }
    }
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    const data = load();
    const config = data[member.guild.id]?.goodbye;
    if (!config?.script) return;
    const channel = member.guild.channels.cache.get(config.channel);
    if (!channel) return;

    const payload = parseEmbedScript(config.script, { user: member.user, guild: member.guild });
    if (payload) {
      try {
        await channel.send(payload);
      } catch (e) {
        console.error('Goodbye send failed:', e);
      }
    }
  });
};
