const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  name: 'voicecounter',
  description: 'Create a voice members counter channel',
  aliases: ['vcounter'],
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(message, args) {
    const guild = message.guild;
    const count = guild.members.cache.filter(m => m.voice.channel).size;

    const channel = await guild.channels.create({
      name: `Voice: ${count}`,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ['Connect']
        }
      ]
    });

    if (!message.client.voiceCounters) message.client.voiceCounters = new Map();
    message.client.voiceCounters.set(guild.id, channel.id);

    return message.reply(`Voice counter created: ${channel}`);
  }
};
