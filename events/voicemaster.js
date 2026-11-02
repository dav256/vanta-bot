const { ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/voicemaster.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const data = getData();
    const cfg = data[newState.guild.id];
    if (!cfg) return;

    if (newState.channelId === cfg.hub) {
      const channel = await newState.guild.channels.create({
        name: newState.member.user.username + '\'s VC',
        type: ChannelType.GuildVoice,
        parent: cfg.category,
        permissionOverwrites: [
          { id: newState.member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers] }
        ]
      });
      await newState.setChannel(channel).catch(() => {});
    }

    if (oldState.channel && oldState.channel.parentId === cfg.category && oldState.channelId !== cfg.hub) {
      if (oldState.channel.members.size === 0) {
        await oldState.channel.delete().catch(() => {});
      }
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('vm_')) return;

    const member = interaction.member;
    const channel = member.voice.channel;
    if (!channel) return interaction.reply({ content: 'Join a voice channel first.', ephemeral: true });

    if (interaction.customId === 'vm_lock') {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
      return interaction.reply({ content: 'Channel locked.', ephemeral: true });
    }
    if (interaction.customId === 'vm_unlock') {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
      return interaction.reply({ content: 'Channel unlocked.', ephemeral: true });
    }
    if (interaction.customId === 'vm_ghost') {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
      return interaction.reply({ content: 'Channel hidden.', ephemeral: true });
    }
    if (interaction.customId === 'vm_reveal') {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: null });
      return interaction.reply({ content: 'Channel revealed.', ephemeral: true });
    }
    if (interaction.customId === 'vm_disconnect') {
      await member.voice.disconnect();
      return interaction.reply({ content: 'Disconnected.', ephemeral: true });
    }
  });

  console.log('[Events] VoiceMaster loaded');
};
