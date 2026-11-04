const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'sticky.json');

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

function get(guildId, channelId) {
  const data = load();
  return data[guildId]?.[channelId] || null;
}

function set(guildId, channelId, message, messageId) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = { message, messageId };
  save(data);
}

function remove(guildId, channelId) {
  const data = load();
  if (data[guildId]) delete data[guildId][channelId];
  save(data);
}

module.exports = { get, set, remove };
