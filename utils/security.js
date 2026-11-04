const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'security.json');

const defaults = {
  antinuke: {
    enabled: true,
    punishment: 'ban',
    threshold: 3,
    window: 60,
    modules: {
      channelDelete: true,
      channelCreate: true,
      roleDelete: true,
      roleCreate: true,
      ban: true,
      kick: true,
      webhookCreate: true,
      emojiDelete: true,
      botAdd: true
    },
    whitelist: []
  },
  antiraid: {
    enabled: true,
    massJoin: { enabled: true, threshold: 8, window: 10, punishment: 'kick', lock: true },
    newAccount: { enabled: true, age: 7, unit: 'days', punishment: 'kick' },
    noAvatar: { enabled: false, punishment: 'kick' }
  }
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
  const cfg = data[guildId];
  if (cfg.antinuke && cfg.antinuke.modules) {
    Object.keys(defaults.antinuke.modules).forEach(k => {
      if (cfg.antinuke.modules[k] === undefined) cfg.antinuke.modules[k] = defaults.antinuke.modules[k];
    });
  }
  return cfg;
}

function update(guildId, pathStr, value) {
  const data = load();
  if (!data[guildId]) data[guildId] = JSON.parse(JSON.stringify(defaults));
  const keys = pathStr.split('.');
  let obj = data[guildId];
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  save(data);
}

module.exports = { get, update, defaults };
