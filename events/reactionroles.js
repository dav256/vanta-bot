const rr = require('../utils/reactionroles');

module.exports = (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }
    const message = reaction.message;
    if (!message.guild) return;

    const roles = rr.get(message.guild.id);
    const match = roles.find(r => r.messageId === message.id && (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.toString()));
    if (!match) return;

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = message.guild.roles.cache.get(match.roleId);
    if (role && member.manageable) {
      await member.roles.add(role).catch(() => {});
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }
    const message = reaction.message;
    if (!message.guild) return;

    const roles = rr.get(message.guild.id);
    const match = roles.find(r => r.messageId === message.id && (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.toString()));
    if (!match) return;

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = message.guild.roles.cache.get(match.roleId);
    if (role && member.manageable) {
      await member.roles.remove(role).catch(() => {});
    }
  });
};
