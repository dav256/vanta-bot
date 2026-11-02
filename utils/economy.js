const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'economy.json');

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

function getBalance(guildId, userId) {
  const data = load();
  return data[guildId]?.[userId]?.balance || 0;
}

function setBalance(guildId, userId, amount) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0 };
  data[guildId][userId].balance = amount;
  save(data);
}

function daily(guildId, userId) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0 };
  const user = data[guildId][userId];
  const now = Date.now();
  if (now - user.lastDaily < 86400000) {
    const hoursLeft = Math.ceil((86400000 - (now - user.lastDaily)) / 3600000);
    return { success: false, hoursLeft };
  }
  const amount = 100;
  user.balance += amount;
  user.lastDaily = now;
  save(data);
  return { success: true, amount, balance: user.balance };
}

function transfer(guildId, fromId, toId, amount) {
  const fromBal = getBalance(guildId, fromId);
  if (fromBal < amount) return { success: false };
  setBalance(guildId, fromId, fromBal - amount);
  setBalance(guildId, toId, getBalance(guildId, toId) + amount);
  return { success: true };
}

module.exports = { getBalance, setBalance, daily, transfer };
