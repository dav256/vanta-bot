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
    const config = data[member.guild.id]?.welcome;
    if (!config || !config.script) return;

    const channel = member.guild.channels.cache.get(config.channel);
    if (!channel) return;

    const payload = parseEmbedScript(config.script, {
      user: member.user,
      guild: member.guild
    });

    if (payload) {
      try {
        await channel.send(payload);
      } catch (e) {
        console.error('Welcome send failed:', e);
      }
    }
  });
};
