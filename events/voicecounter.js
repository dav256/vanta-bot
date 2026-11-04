const { Events } = require('discord.js');

module.exports = (client) => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const channelId = client.voiceCounters?.get(guild.id);
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    const count = guild.members.cache.filter(m => m.voice.channel).size;
    const name = `Voice: ${count}`;
    if (channel.name !== name) {
      await channel.setName(name).catch(() => {});
    }
  });
};
