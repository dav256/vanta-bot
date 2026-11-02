const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'cases.json');

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

function create(guildId, type, userId, modId, reason, extra = {}) {
  const data = load();
  if (!data[guildId]) data[guildId] = [];
  const id = data[guildId].length + 1;
  const caseData = { id, type, userId, modId, reason, timestamp: Date.now(), ...extra };
  data[guildId].push(caseData);
  save(data);
  return caseData;
}

function get(guildId, caseId) {
  const data = load();
  return data[guildId]?.find(c => c.id === caseId) || null;
}

function list(guildId, userId) {
  const data = load();
  const cases = data[guildId] || [];
  return userId ? cases.filter(c => c.userId === userId) : cases;
}

module.exports = { create, get, list };
