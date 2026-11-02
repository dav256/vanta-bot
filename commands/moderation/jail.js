const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/jail.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'jail',
  description: 'Jail or unjail a member',
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const data = getData();
    const guildId = message.guild.id;

    if (!data[guildId]) data[guildId] = {};

    if (sub === 'setup') {
      const role = message.mentions.roles.first();
      const channel = message.mentions.channels.first();
      if (!role || !channel) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle('Jail Setup')
            .setDescription('Usage: `!jail setup @JailRole #jail-channel`\n\nThis role will be applied when someone is jailed. They should only be able to see the jail channel.')]
        });
      }
      data[guildId].role = role.id;
      data[guildId].channel = channel.id;
      saveData(data);
      return message.reply(`Jail set up: ${role} in ${channel}`);
    }

    if (sub === 'unjail') {
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!target) return message.reply('Mention a member to unjail.');
      const role = message.guild.roles.cache.get(data[guildId]?.role);
      if (!role) return message.reply('Jail is not set up. Use `!jail setup`');
      await target.roles.remove(role).catch(() => {});
      return message.reply(`${target.user.tag} has been unjailed.`);
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!target) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('Jail Commands')
          .setDescription('`!jail setup @role #channel` — Configure jail\n`!jail @user [reason]` — Jail a member\n`!jail unjail @user` — Release a member')]
      });
    }

    const role = message.guild.roles.cache.get(data[guildId]?.role);
    if (!role) return message.reply('Jail is not set up. Use `!jail setup @role #channel`');

    await target.roles.add(role).catch(() => {});
    const channel = message.guild.channels.cache.get(data[guildId].channel);
    if (channel) channel.send(`${target} has been jailed. Reason: ${reason}`).catch(() => {});

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('Jailed')
        .setDescription(`${target.user.tag} has been jailed.\n**Reason:** ${reason}`)]
    });
  }
};
