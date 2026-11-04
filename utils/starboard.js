const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'starboard.json');

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
  return data[guildId] || { channel: null, threshold: 3, emoji: '⭐', messages: {} };
}

function set(guildId, config) {
  const data = load();
  data[guildId] = config;
  save(data);
}

module.exports = { get, set, load, save };
