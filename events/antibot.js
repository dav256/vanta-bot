const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/antibot.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    if (!member.user.bot) return;

    const data = getData();
    const cfg = data[member.guild.id];
    if (!cfg || !cfg.enabled) return;

    if (cfg.whitelist?.includes(member.id)) return;

    await member.kick('Antibot: Unauthorized bot').catch(() => {});
  });

  console.log('[Events] Antibot loaded');
};
