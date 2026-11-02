const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/autoresponders.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const data = getData();
    const responses = data[message.guild.id];
    if (!responses) return;

    const content = message.content.toLowerCase();
    for (const [trigger, response] of Object.entries(responses)) {
      if (content.includes(trigger)) {
        message.reply(response).catch(() => {});
        break;
      }
    }
  });

  console.log('[Events] Autoresponders loaded');
};
