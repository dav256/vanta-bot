const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'data', 'requiredroles.json');

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
  return data[guildId] || {};
}

function set(guildId, config) {
  const data = load();
  data[guildId] = config;
  save(data);
}

module.exports = {
  name: 'requiredrole',
  description: 'Lock roles behind other roles',
  aliases: ['reqrole'],
  permissions: [PermissionFlagsBits.ManageRoles],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Required Roles')
          .setDescription('Lock reaction roles, button roles, and dropdowns behind other roles.')
          .addFields(
            { name: 'Set', value: '`requiredrole set @role @required`', inline: false },
            { name: 'List', value: '`requiredrole list`', inline: false },
            { name: 'Remove', value: '`requiredrole remove @role`', inline: false }
          )]
      });
    }

    if (sub === 'set') {
      const roles = message.mentions.roles;
      if (roles.size < 2) return message.reply('Mention the role and the required role.');
      const [target, required] = roles.values();
      const config = get(message.guild.id);
      config[target.id] = required.id;
      set(message.guild.id, config);
      return message.reply(`${target} now requires ${required}.`);
    }

    if (sub === 'list') {
      const config = get(message.guild.id);
      const entries = Object.entries(config);
      if (!entries.length) return message.reply('No required roles set.');
      const desc = entries.map(([role, req]) => `<@&${role}> requires <@&${req}>`).join('\n');
      return message.reply({
        embeds: [new EmbedBuilder().setColor(0xFFFFFF).setTitle('Required Roles').setDescription(desc)]
      });
    }

    if (sub === 'remove') {
      const role = message.mentions.roles.first();
      if (!role) return message.reply('Mention a role.');
      const config = get(message.guild.id);
      delete config[role.id];
      set(message.guild.id, config);
      return message.reply(`Removed requirement from ${role}.`);
    }

    return message.reply('Use `requiredrole help`.');
  }
};
