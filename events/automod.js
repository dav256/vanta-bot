const { Events, EmbedBuilder } = require('discord.js');
const filters = require('../utils/filters');
const cases = require('../utils/cases');

const spamMap = new Map();

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;
    if (message.member?.permissions.has('ManageMessages')) return;

    const config = filters.get(message.guild.id);
    const content = message.content || '';

    if (config.caps?.enabled && content.length > 8) {
      const letters = content.replace(/[^a-zA-Z]/g, '');
      const caps = (letters.match(/[A-Z]/g) || []).length;
      if (letters.length && (caps / letters.length) * 100 >= (config.caps.threshold || 70)) {
        return punish(message, 'caps', config.caps.punishment);
      }
    }

    if (config.invites?.enabled && /(discord\.gg|discord\.com\/invite)\/\w+/i.test(content)) {
      return punish(message, 'invites', config.invites.punishment);
    }

    if (config.massmention?.enabled) {
      const mentions = message.mentions.users.size + message.mentions.roles.size;
      if (mentions >= (config.massmention.threshold || 5)) {
        return punish(message, 'massmention', config.massmention.punishment);
      }
    }

    if (config.emoji?.enabled) {
      const emojiCount = (content.match(/<a?:\w+:\d+>/g) || []).length + (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
      if (emojiCount >= (config.emoji.threshold || 8)) {
        return punish(message, 'emoji', config.emoji.punishment);
      }
    }

    if (config.spam?.enabled) {
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      if (!spamMap.has(key)) spamMap.set(key, []);
      const times = spamMap.get(key).filter(t => now - t < (config.spam.window || 5) * 1000);
      times.push(now);
      spamMap.set(key, times);
      if (times.length >= (config.spam.threshold || 5)) {
        return punish(message, 'spam', config.spam.punishment);
      }
    }
  });
};

async function punish(message, type, punishment) {
  try {
    await message.delete().catch(() => {});
  } catch {}

  if (punishment === 'warn') {
    const reason = `AutoMod: ${type}`;
    const caseData = cases.create(message.guild.id, 'warn', message.author.id, message.client.user.id, reason);
    const embed = new EmbedBuilder()
      .setColor(0xFFAA00)
      .setTitle(`Case #${caseData.id} — Warning`)
      .setDescription(`${message.author} was warned for **${type}**.`)
      .setTimestamp();
    message.channel.send({ embeds: [embed] }).catch(() => {});
  }
}
