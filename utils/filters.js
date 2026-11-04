const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'filters.json');

const defaults = {
  caps: { enabled: false, threshold: 70, punishment: 'delete' },
  links: { enabled: false, punishment: 'delete', allowed: [] },
  invites: { enabled: false, punishment: 'delete' },
  spam: { enabled: false, threshold: 5, window: 5, punishment: 'delete' },
  massmention: { enabled: false, threshold: 5, punishment: 'delete' },
  emoji: { enabled: false, threshold: 8, punishment: 'delete' },
  spoilers: { enabled: false, punishment: 'delete' }
};

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
  if (!data[guildId]) {
    data[guildId] = JSON.parse(JSON.stringify(defaults));
    save(data);
  }
  return data[guildId];
}

function update(guildId, type, key, value) {
  const data = load();
  if (!data[guildId]) data[guildId] = JSON.parse(JSON.stringify(defaults));
  if (!data[guildId][type]) data[guildId][type] = {};
  data[guildId][type][key] = value;
  save(data);
}

module.exports = { get, update, defaults };
