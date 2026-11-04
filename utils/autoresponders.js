const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'autoresponders.json');

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

function add(guildId, trigger, response, exact = false) {
  const data = load();
  if (!data[guildId]) data[guildId] = [];
  data[guildId].push({ trigger: trigger.toLowerCase(), response, exact });
  save(data);
}

function remove(guildId, trigger) {
  const data = load();
  if (!data[guildId]) return false;
  const before = data[guildId].length;
  data[guildId] = data[guildId].filter(r => r.trigger !== trigger.toLowerCase());
  save(data);
  return data[guildId].length < before;
}

function clear(guildId) {
  const data = load();
  delete data[guildId];
  save(data);
}

module.exports = { get, add, remove, clear, load };
