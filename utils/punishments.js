const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'punishments.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function get(guildId, type) {
  const data = load();
  return data[guildId]?.[type] || null;
}

function set(guildId, type, message) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][type] = message;
  save(data);
}

function reset(guildId, type) {
  const data = load();
  if (data[guildId]) {
    if (type) delete data[guildId][type];
    else delete data[guildId];
    save(data);
  }
}

function replace(template, data) {
  if (!template) return null;
  return template
    .replace(/{user}/g, data.user?.tag || data.user?.username || 'Unknown')
    .replace(/{user\.mention}/g, data.user ? `<@${data.user.id}>` : '{user.mention}')
    .replace(/{user\.id}/g, data.user?.id || '')
    .replace(/{moderator}/g, data.moderator?.tag || data.moderator?.username || 'Unknown')
    .replace(/{moderator\.mention}/g, data.moderator ? `<@${data.moderator.id}>` : '{moderator.mention}')
    .replace(/{reason}/g, data.reason || 'No reason provided')
    .replace(/{guild}/g, data.guild?.name || '')
    .replace(/{duration}/g, data.duration || '');
}

module.exports = { get, set, reset, replace, load };
