const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'giveaways.json');

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

function get(guildId) {
  const data = load();
  return data[guildId] || [];
}

function add(guildId, giveaway) {
  const data = load();
  if (!data[guildId]) data[guildId] = [];
  data[guildId].push(giveaway);
  save(data);
}

function remove(guildId, messageId) {
  const data = load();
  if (!data[guildId]) return;
  data[guildId] = data[guildId].filter(g => g.messageId !== messageId);
  save(data);
}

module.exports = { get, add, remove };
