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
  description: 'Create custom NPCs that talk, revive channels, and ask questions',
  aliases: ['character'],
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('NPC System')
          .setDescription('Characters that chat, revive quiet channels, and ask questions.')
          .addFields(
            { name: 'Create', value: '`npc create <name> | <trigger> | <response>`', inline: false },
            { name: 'Responses', value: '`npc responses <name> | response1 | response2`', inline: false },
            { name: 'Revive', value: '`npc revive <name> #channel` — posts when quiet', inline: false },
            { name: 'Question', value: '`npc question <name> | What brings you here?`', inline: false },
            { name: 'List', value: '`npc list`', inline: false },
            { name: 'Delete', value: '`npc delete <name>`', inline: false }
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
      const entry = {
        name,
        trigger: trigger.toLowerCase(),
        responses: [response],
        reviveChannel: null,
        questions: []
      };

      if (existing !== -1) list[existing] = { ...list[existing], ...entry };
      else list.push(entry);

      set(message.guild.id, list);
      return message.reply(`NPC **${name}** created. Triggers on: \`${trigger}\``);
    }

    if (sub === 'responses') {
      const rest = args.slice(1).join(' ');
      const parts = rest.split('|').map(s => s.trim());
      if (parts.length < 2) return message.reply('Usage: `npc responses <name> | response1 | response2`');

      const name = parts[0];
      const responses = parts.slice(1).filter(Boolean);
      const list = get(message.guild.id);
      const npc = list.find(n => n.name.toLowerCase() === name.toLowerCase());
      if (!npc) return message.reply('NPC not found.');

      npc.responses = responses;
      set(message.guild.id, list);
      return message.reply(`**${npc.name}** now has ${responses.length} responses.`);
    }

    if (sub === 'revive') {
      const name = args[1];
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
      if (!name || !channel) return message.reply('Usage: `npc revive <name> #channel`');

      const list = get(message.guild.id);
      const npc = list.find(n => n.name.toLowerCase() === name.toLowerCase());
      if (!npc) return message.reply('NPC not found.');

      npc.reviveChannel = channel.id;
      set(message.guild.id, list);
      return message.reply(`**${npc.name}** will revive ${channel} when quiet.`);
    }

    if (sub === 'question') {
      const rest = args.slice(1).join(' ');
      const parts = rest.split('|').map(s => s.trim());
      if (parts.length < 2) return message.reply('Usage: `npc question <name> | question text`');

      const name = parts[0];
      const question = parts.slice(1).join(' | ');
      const list = get(message.guild.id);
      const npc = list.find(n => n.name.toLowerCase() === name.toLowerCase());
      if (!npc) return message.reply('NPC not found.');

      if (!npc.questions) npc.questions = [];
      npc.questions.push(question);
      set(message.guild.id, list);
      return message.reply(`Question added to **${npc.name}**.`);
    }

    if (sub === 'list') {
      const list = get(message.guild.id);
      if (!list.length) return message.reply('No NPCs created.');
      const desc = list.map(n => {
        const extras = [];
        if (n.reviveChannel) extras.push('revives');
        if (n.questions?.length) extras.push(`${n.questions.length} Q`);
        return `**${n.name}** — \`${n.trigger}\`${extras.length ? ` (${extras.join(', ')})` : ''}`;
      }).join('\n');
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
