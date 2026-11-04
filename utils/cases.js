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

function getNextId(guildId) {
  const data = load();
  if (!data[guildId]) data[guildId] = { nextId: 1, cases: [] };
  return data[guildId].nextId || 1;
}

function create(guildId, type, userId, moderatorId, reason, extra = {}) {
  const data = load();
  if (!data[guildId]) data[guildId] = { nextId: 1, cases: [] };

  const id = data[guildId].nextId;
  const caseData = {
    id,
    type,
    userId,
    moderatorId,
    reason: reason || 'No reason provided',
    timestamp: Date.now(),
    ...extra
  };

  data[guildId].cases.push(caseData);
  data[guildId].nextId = id + 1;
  save(data);
  return caseData;
}

function get(guildId, caseId) {
  const data = load();
  if (!data[guildId]) return null;
  return data[guildId].cases.find(c => c.id === caseId) || null;
}

function getByUser(guildId, userId) {
  const data = load();
  if (!data[guildId]) return [];
  return data[guildId].cases.filter(c => c.userId === userId);
}

function update(guildId, caseId, updated) {
  const data = load();
  if (!data[guildId]) return null;
  const idx = data[guildId].cases.findIndex(c => c.id === caseId);
  if (idx === -1) return null;
  data[guildId].cases[idx] = updated;
  save(data);
  return updated;
}

module.exports = { create, get, getByUser, getNextId, update };
