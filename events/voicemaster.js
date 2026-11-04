const { ChannelType, PermissionFlagsBits } = require('discord.js');
const vm = require('../utils/voicemaster');

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const config = vm.get(guild.id);
    if (!config.joinChannel) return;

    if (newState.channelId === config.joinChannel && oldState.channelId !== config.joinChannel) {
      try {
        const member = newState.member;
        const channelName = `${member.displayName}'s Channel`;

        const tempChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: config.category || null,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.Connect]
            },
            {
              id: member.id,
              allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
            }
          ]
        });

        await member.voice.setChannel(tempChannel);

        if (!config.channels) config.channels = {};
        config.channels[tempChannel.id] = member.id;
        vm.set(guild.id, config);
      } catch (e) {
        console.error('VoiceMaster create failed:', e);
      }
    }

    if (oldState.channel && config.channels?.[oldState.channel.id]) {
      if (oldState.channel.members.size === 0) {
        try {
          await oldState.channel.delete();
          delete config.channels[oldState.channel.id];
          vm.set(guild.id, config);
        } catch {}
      }
    }
  });
};
