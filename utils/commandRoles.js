const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'commandRoles.json');

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

function getGuild(guildId) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  return data[guildId];
}

function getRoles(guildId, commandName) {
  const guild = getGuild(guildId);
  return guild[commandName.toLowerCase()] || [];
}

function setRoles(guildId, commandName, roleIds) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][commandName.toLowerCase()] = roleIds;
  save(data);
}

function addRole(guildId, commandName, roleId) {
  const roles = getRoles(guildId, commandName);
  if (!roles.includes(roleId)) roles.push(roleId);
  setRoles(guildId, commandName, roles);
  return roles;
}

function removeRole(guildId, commandName, roleId) {
  const roles = getRoles(guildId, commandName).filter(id => id !== roleId);
  setRoles(guildId, commandName, roles);
  return roles;
}

function list(guildId) {
  return getGuild(guildId);
}

function memberCanUse(member, commandName) {
  if (!member?.guild) return true;
  if (member.permissions?.has?.('Administrator')) return true;

  const roles = getRoles(member.guild.id, commandName);
  if (!roles.length) return null;

  return roles.some(id => member.roles.cache.has(id));
}

module.exports = {
  getRoles,
  setRoles,
  addRole,
  removeRole,
  list,
  memberCanUse
};
