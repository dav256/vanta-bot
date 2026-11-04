const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'dropdowns.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('dropdown_')) return;

    const data = load()[interaction.guild.id] || [];
    const menu = data.find(d => d.messageId === interaction.message.id);
    if (!menu) return interaction.reply({ content: 'Menu not found.', ephemeral: true });

    const member = interaction.member;
    const selected = new Set(interaction.values);
    const allRoles = new Set(menu.roles);

    try {
      for (const roleId of allRoles) {
        if (selected.has(roleId)) {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId).catch(() => {});
          }
        } else {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId).catch(() => {});
          }
        }
      }
      await interaction.reply({ content: 'Roles updated.', ephemeral: true });
    } catch {
      await interaction.reply({ content: 'Failed to update roles.', ephemeral: true });
    }
  });
};
