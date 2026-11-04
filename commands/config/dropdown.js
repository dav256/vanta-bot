const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'dropdowns.json');

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
  name: 'dropdown',
  description: 'Create dropdown role menus',
  aliases: ['dd', 'selectrole'],
  permissions: [PermissionFlagsBits.ManageRoles],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Dropdown Roles')
          .setDescription('Create select menus for roles (up to 25).')
          .addFields(
            { name: 'Create', value: '`dropdown create <title> | role1 | role2 | ...`', inline: false },
            { name: 'List', value: '`dropdown list`', inline: false },
            { name: 'Delete', value: '`dropdown delete <title>`', inline: false }
          )]
      });
    }

    if (sub === 'create') {
      const rest = args.slice(1).join(' ');
      const parts = rest.split('|').map(s => s.trim());
      if (parts.length < 2) return message.reply('Usage: `dropdown create <title> | @role1 | @role2`');

      const title = parts[0];
      const roleMentions = message.mentions.roles;
      if (roleMentions.size === 0) return message.reply('Mention at least one role.');
      if (roleMentions.size > 25) return message.reply('Max 25 roles.');

      const options = roleMentions.map(r => ({
        label: r.name.slice(0, 100),
        value: r.id,
        description: `Get the ${r.name} role`
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId(`dropdown_${Date.now()}`)
        .setPlaceholder('Select roles')
        .setMinValues(0)
        .setMaxValues(Math.min(options.length, 25))
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(select);

      const sent = await message.channel.send({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle(title).setDescription('Select roles below.')],
        components: [row]
      });

      const list = get(message.guild.id);
      list.push({
        title,
        messageId: sent.id,
        channelId: message.channel.id,
        roles: roleMentions.map(r => r.id)
      });
      set(message.guild.id, list);

      return message.reply('Dropdown created.');
    }

    if (sub === 'list') {
      const list = get(message.guild.id);
      if (!list.length) return message.reply('No dropdowns.');
      const desc = list.map(d => `**${d.title}** — ${d.roles.length} roles`).join('\n');
      return message.reply({ embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Dropdowns').setDescription(desc)] });
    }

    if (sub === 'delete') {
      const title = args.slice(1).join(' ').toLowerCase();
      const list = get(message.guild.id).filter(d => d.title.toLowerCase() !== title);
      set(message.guild.id, list);
      return message.reply('Dropdown deleted.');
    }

    return message.reply('Use `dropdown help`.');
  }
};
