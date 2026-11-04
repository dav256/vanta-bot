const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'leaderboard.json');
const voiceStart = new Map();

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

function save(data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = (client) => {
  client.on(Events.MessageCreate, (message) => {
    if (!message.guild || message.author.bot) return;
    const data = load();
    if (!data[message.guild.id]) data[message.guild.id] = { messages: {}, voice: {} };
    const id = message.author.id;
    data[message.guild.id].messages[id] = (data[message.guild.id].messages[id] || 0) + 1;
    save(data);
  });

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const userId = newState.id || oldState.id;
    const guildId = newState.guild?.id || oldState.guild?.id;
    if (!guildId) return;

    const data = load();
    if (!data[guildId]) data[guildId] = { messages: {}, voice: {} };

    if (!oldState.channel && newState.channel) {
      voiceStart.set(userId, Date.now());
    }

    if (oldState.channel && !newState.channel) {
      const start = voiceStart.get(userId);
      if (start) {
        const mins = (Date.now() - start) / 60000;
        data[guildId].voice[userId] = (data[guildId].voice[userId] || 0) + mins;
        voiceStart.delete(userId);
        save(data);
      }
    }
  });
};
