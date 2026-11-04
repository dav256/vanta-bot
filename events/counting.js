const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'counting.json');

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

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;

    const data = load();
    const config = data[message.guild.id];
    if (!config?.channel || message.channel.id !== config.channel) return;

    const num = parseInt(message.content.trim());
    if (isNaN(num)) return;

    const expected = config.count + 1;

    if (message.author.id === config.lastUser) {
      await message.react('❌').catch(() => {});
      await message.reply('You cannot count twice in a row.').catch(() => {});
      config.count = 0;
      config.lastUser = null;
      data[message.guild.id] = config;
      save(data);
      return;
    }

    if (num !== expected) {
      await message.react('❌').catch(() => {});
      await message.reply(`Wrong number. Expected **${expected}**. Count reset.`).catch(() => {});
      config.count = 0;
      config.lastUser = null;
      data[message.guild.id] = config;
      save(data);
      return;
    }

    config.count = num;
    config.lastUser = message.author.id;
    if (num > config.high) config.high = num;
    data[message.guild.id] = config;
    save(data);

    await message.react('✅').catch(() => {});
  });
};
