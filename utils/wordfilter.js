const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'wordfilter.json');

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

function add(guildId, word) {
  const data = load();
  if (!data[guildId]) data[guildId] = [];
  if (!data[guildId].includes(word.toLowerCase())) {
    data[guildId].push(word.toLowerCase());
    save(data);
  }
}

function remove(guildId, word) {
  const data = load();
  if (!data[guildId]) return false;
  const before = data[guildId].length;
  data[guildId] = data[guildId].filter(w => w !== word.toLowerCase());
  save(data);
  return data[guildId].length < before;
}

module.exports = { get, add, remove };
