const { EmbedBuilder, PermissionFlagsBits, ChannelType, OverwriteType } = require('discord.js');

module.exports = {
  name: 'setup',
  description: 'Sets up moderation roles and channels (jail, mutes, logs)',
  aliases: ['modsetup'],
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args, client) {
    const guild = message.guild;
    const botMember = guild.members.me;

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles) || 
        !botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({ content: 'I need **Manage Roles** and **Manage Channels** permissions.' });
    }

    const loading = await message.reply({ content: 'Setting up moderation system...' });

    try {
      const roles = {
        muted: await getOrCreateRole(guild, 'Muted', '#808080'),
        imute: await getOrCreateRole(guild, 'Image Muted', '#A0A0A0'),
        rmute: await getOrCreateRole(guild, 'Reaction Muted', '#C0C0C0'),
        jailed: await getOrCreateRole(guild, 'Jailed', '#FF6B6B')
      };

      let category = guild.channels.cache.find(c => c.name === 'Moderation' && c.type === ChannelType.GuildCategory);
      if (!category) {
        category = await guild.channels.create({
          name: 'Moderation',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: botMember.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
            }
          ]
        });
      }

      let logsChannel = guild.channels.cache.find(c => c.name === 'logs' && c.parentId === category.id);
      if (!logsChannel) {
        logsChannel = await guild.channels.create({
          name: 'logs',
          type: ChannelType.GuildText,
          parent: category.id,
          topic: 'Moderation logs'
        });
      }

      let jailChannel = guild.channels.cache.find(c => c.name === 'jail' && c.parentId === category.id);
      if (!jailChannel) {
        jailChannel = await guild.channels.create({
          name: 'jail',
          type: ChannelType.GuildText,
          parent: category.id,
          topic: 'Jailed members can only see this channel',
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: roles.jailed.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            },
            {
              id: botMember.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
            }
          ]
        });
      }

      await applyMutePermissions(guild, roles);

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Moderation Setup Complete')
        .setDescription('Roles and channels have been created/configured.')
        .addFields(
          { name: 'Roles Created', value: `Muted: ${roles.muted}\nImage Muted: ${roles.imute}\nReaction Muted: ${roles.rmute}\nJailed: ${roles.jailed}`, inline: false },
          { name: 'Channels', value: `Category: ${category}\nLogs: ${logsChannel}\nJail: ${jailChannel}`, inline: false }
        )
        .setFooter({ text: 'Vanta Moderation' })
        .setTimestamp();

      await loading.edit({ content: null, embeds: [embed] });

    } catch (error) {
      console.error(error);
      await loading.edit({ content: 'Setup failed. Check console for details. Make sure I have proper permissions and role hierarchy.' });
    }
  }
};

async function getOrCreateRole(guild, name, color) {
  let role = guild.roles.cache.find(r => r.name === name);
  if (!role) {
    role = await guild.roles.create({
      name,
      color,
      reason: 'Vanta moderation setup',
      hoist: false,
      mentionable: false
    });
  }
  return role;
}

async function applyMutePermissions(guild, roles) {
  const channels = guild.channels.cache.filter(c => c.isTextBased() || c.isVoiceBased());
  
  for (const channel of channels.values()) {
    try {
      await channel.permissionOverwrites.edit(roles.muted, {
        SendMessages: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false
      }).catch(() => {});

      await channel.permissionOverwrites.edit(roles.imute, {
        AttachFiles: false,
        EmbedLinks: false
      }).catch(() => {});

      await channel.permissionOverwrites.edit(roles.rmute, {
        AddReactions: false,
        UseExternalEmojis: false,
        UseExternalStickers: false
      }).catch(() => {});

      if (channel.name !== 'jail') {
        await channel.permissionOverwrites.edit(roles.jailed, {
          ViewChannel: false
        }).catch(() => {});
      }
    } catch (e) {}
  }
}
