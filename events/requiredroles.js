const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'requiredroles.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

module.exports = (client) => {
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const config = load()[newMember.guild.id];
    if (!config) return;

    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    for (const role of added.values()) {
      const requiredId = config[role.id];
      if (requiredId && !newMember.roles.cache.has(requiredId)) {
        await newMember.roles.remove(role).catch(() => {});
        try {
          await newMember.send(`You need <@&${requiredId}> to get ${role}.`).catch(() => {});
        } catch {}
      }
    }
  });
};
