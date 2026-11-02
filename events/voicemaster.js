const { ChannelType, PermissionFlagsBits, EmbedBuilder, InviteTargetType, OverwriteType } = require('discord.js');
const { emoji } = require('../utils/emojis');

// Discord's "Watch Together" activity application
const WATCH_TOGETHER_APP_ID = '880218394199220334';
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

  // The owner of a temp VC is the member overwrite with ManageChannels (set on creation above).
  function getOwnerId(channel) {
    const ow = channel.permissionOverwrites.cache.find(o =>
      o.type === OverwriteType.Member && o.allow.has(PermissionFlagsBits.ManageChannels));
    return ow?.id || null;
  }

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('vm_')) return;

    const member = interaction.member;
    const channel = member.voice.channel;
    const reply = (text) => interaction.reply({ content: text, ephemeral: true });
    if (!channel) return reply('Join a voice channel first.');

    // Only act on VoiceMaster temp channels
    const cfg = getData()[interaction.guild.id];
    if (!cfg || channel.parentId !== cfg.category || channel.id === cfg.hub) {
      return reply("You're not in a VoiceMaster channel.");
    }

    const action = interaction.customId.slice(3);
    const ownerId = getOwnerId(channel);
    const isOwner = ownerId === member.id;
    const ownerOnly = ['lock', 'unlock', 'ghost', 'reveal', 'increase', 'decrease'];
    if (ownerOnly.includes(action) && !isOwner) {
      return reply("You don't own this voice channel.");
    }

    const everyone = interaction.guild.roles.everyone;

    if (action === 'lock') {
      await channel.permissionOverwrites.edit(everyone, { Connect: false });
      return reply(`${emoji('lock')} Channel locked.`);
    }
    if (action === 'unlock') {
      await channel.permissionOverwrites.edit(everyone, { Connect: null });
      return reply(`${emoji('unlock')} Channel unlocked.`);
    }
    if (action === 'ghost') {
      await channel.permissionOverwrites.edit(everyone, { ViewChannel: false });
      return reply(`${emoji('ghost')} Channel hidden.`);
    }
    if (action === 'reveal') {
      await channel.permissionOverwrites.edit(everyone, { ViewChannel: null });
      return reply(`${emoji('reveal')} Channel revealed.`);
    }
    if (action === 'disconnect') {
      await member.voice.disconnect();
      return reply(`${emoji('disconnect')} Disconnected.`);
    }
    if (action === 'claim') {
      if (isOwner) return reply('You already own this voice channel.');
      if (ownerId && channel.members.has(ownerId)) {
        return reply('The owner is still in the voice channel.');
      }
      if (ownerId) await channel.permissionOverwrites.delete(ownerId).catch(() => {});
      await channel.permissionOverwrites.edit(member.id, { ManageChannels: true, MoveMembers: true });
      return reply(`${emoji('claim')} You now own this voice channel.`);
    }
    if (action === 'increase' || action === 'decrease') {
      const delta = action === 'increase' ? 1 : -1;
      const limit = Math.min(99, Math.max(0, (channel.userLimit || 0) + delta));
      await channel.setUserLimit(limit);
      return reply(`${emoji(action)} User limit set to **${limit === 0 ? 'unlimited' : limit}**.`);
    }
    if (action === 'activity') {
      try {
        const invite = await channel.createInvite({
          targetType: InviteTargetType.EmbeddedApplication,
          targetApplication: WATCH_TOGETHER_APP_ID,
          maxAge: 86400
        });
        return reply(`${emoji('activity')} [Click to start the activity](${invite.url})`);
      } catch (err) {
        return reply('Could not start an activity in this channel.');
      }
    }
    if (action === 'information') {
      const everyoneOw = channel.permissionOverwrites.cache.get(everyone.id);
      const locked = everyoneOw?.deny.has(PermissionFlagsBits.Connect) || false;
      const hidden = everyoneOw?.deny.has(PermissionFlagsBits.ViewChannel) || false;
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`${emoji('information')} ${channel.name}`)
          .addFields(
            { name: 'Owner', value: ownerId ? `<@${ownerId}>` : 'None', inline: true },
            { name: 'Members', value: `${channel.members.size}`, inline: true },
            { name: 'User limit', value: channel.userLimit ? `${channel.userLimit}` : 'Unlimited', inline: true },
            { name: 'Locked', value: `${locked ? emoji('lock') : emoji('unlock')} ${locked ? 'Yes' : 'No'}`, inline: true },
            { name: 'Hidden', value: `${hidden ? emoji('ghost') : emoji('reveal')} ${hidden ? 'Yes' : 'No'}`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
          )],
        ephemeral: true
      });
    }
  });

  console.log('[Events] VoiceMaster loaded');
};
