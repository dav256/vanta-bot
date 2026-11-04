const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'todos.json');

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

function get(userId) {
  const data = load();
  return data[userId] || [];
}

function set(userId, list) {
  const data = load();
  data[userId] = list;
  save(data);
}

module.exports = {
  name: 'todo',
  description: 'Private to-do list',
  aliases: ['task'],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'list') {
      const list = get(message.author.id);
      if (!list.length) return message.reply('Your list is empty.');
      const desc = list.map((t, i) => `${i + 1}. ${t.done ? '~~' : ''}${t.text}${t.done ? '~~' : ''}`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('To-Do').setDescription(desc)]
      });
    }

    if (sub === 'add') {
      const text = args.slice(1).join(' ');
      if (!text) return message.reply('What do you want to add?');
      const list = get(message.author.id);
      list.push({ text, done: false });
      set(message.author.id, list);
      return message.reply(`Added: ${text}`);
    }

    if (sub === 'done') {
      const idx = parseInt(args[1]) - 1;
      const list = get(message.author.id);
      if (isNaN(idx) || !list[idx]) return message.reply('Invalid number.');
      list[idx].done = !list[idx].done;
      set(message.author.id, list);
      return message.reply(`Marked #${idx + 1} as ${list[idx].done ? 'done' : 'not done'}.`);
    }

    if (sub === 'remove' || sub === 'delete') {
      const idx = parseInt(args[1]) - 1;
      const list = get(message.author.id);
      if (isNaN(idx) || !list[idx]) return message.reply('Invalid number.');
      const removed = list.splice(idx, 1)[0];
      set(message.author.id, list);
      return message.reply(`Removed: ${removed.text}`);
    }

    if (sub === 'clear') {
      set(message.author.id, []);
      return message.reply('List cleared.');
    }

    return message.reply('Usage: `todo` | `todo add <text>` | `todo done <num>` | `todo remove <num>` | `todo clear`');
  }
};
