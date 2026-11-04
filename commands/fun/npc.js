const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'npcs.json');

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

function set(guildId, list) {
  const data = load();
  data[guildId] = list;
  save(data);
}

module.exports = {
  name: 'npc',
  description: 'Create custom NPCs that talk in chat',
  aliases: ['character'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('NPC System')
          .setDescription('Create custom characters that respond in chat.')
          .addFields(
            { name: 'Create', value: '`npc create <name> | <trigger> | <response>`', inline: false },
            { name: 'List', value: '`npc list`', inline: false },
            { name: 'Delete', value: '`npc delete <name>`', inline: false },
            { name: 'Example', value: '`npc create Guide | hello | Hey there! Need help?`', inline: false }
          )]
      });
    }

    if (sub === 'create' || sub === 'add') {
      const rest = args.slice(1).join(' ');
      const parts = rest.split('|').map(s => s.trim());
      if (parts.length < 3) return message.reply('Usage: `npc create <name> | <trigger> | <response>`');

      const [name, trigger, response] = parts;
      if (!name || !trigger || !response) return message.reply('All three fields are required.');

      const list = get(message.guild.id);
      const existing = list.findIndex(n => n.name.toLowerCase() === name.toLowerCase());
      const entry = { name, trigger: trigger.toLowerCase(), response };

      if (existing !== -1) list[existing] = entry;
      else list.push(entry);

      set(message.guild.id, list);
      return message.reply(`NPC **${name}** created. Triggers on: \`${trigger}\``);
    }

    if (sub === 'list') {
      const list = get(message.guild.id);
      if (!list.length) return message.reply('No NPCs created.');
      const desc = list.map(n => `**${n.name}** — \`${n.trigger}\``).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('NPCs').setDescription(desc)]
      });
    }

    if (sub === 'delete' || sub === 'remove') {
      const name = args.slice(1).join(' ').toLowerCase();
      if (!name) return message.reply('Provide the NPC name.');
      const list = get(message.guild.id).filter(n => n.name.toLowerCase() !== name);
      set(message.guild.id, list);
      return message.reply(`NPC **${name}** deleted.`);
    }

    return message.reply('Use `npc help`.');
  }
};
