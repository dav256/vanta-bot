const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const music = require('../../utils/musicPlayer');

const PRESETS = {
  lofi: 'http://stream.laut.fm/lofi',
  jazz: 'http://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3',
  hits: 'http://streams.ilovemusic.de/iloveradio1.mp3',
  chill: 'http://streams.ilovemusic.de/iloveradio10.mp3',
  classical: 'http://stream.classicalradio.nl/classicalradio.mp3'
};

module.exports = {
  name: 'radio',
  description: '24/7 music radio in a voice channel',
  aliases: ['247', '24/7'],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === 'help') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('24/7 Radio')
          .setDescription('Keep music playing in a voice channel.')
          .addFields(
            { name: 'Start', value: '`radio start lofi` \u00b7 `radio start jazz` \u00b7 `radio start hits`', inline: false },
            { name: 'Custom', value: '`radio start http://stream-url.mp3`', inline: false },
            { name: 'Bind', value: '`radio bind lofi` (while in VC)', inline: false },
            { name: 'Stop / Status', value: '`radio stop` \u00b7 `radio status`', inline: false }
          )]
      });
    }

    if (sub === 'start') {
      const voice = message.member?.voice?.channel;
      if (!voice) return message.reply('**Join a voice channel first**, then run `radio start lofi`.');

      const me = message.guild.members.me;
      const perms = voice.permissionsFor(me);
      if (!perms?.has('Connect') || !perms?.has('Speak')) {
        return message.reply('I need **Connect** and **Speak** in that voice channel.');
      }

      let url = args.slice(1).join(' ').trim();
      if (!url) url = PRESETS.lofi;
      else if (PRESETS[url.toLowerCase()]) url = PRESETS[url.toLowerCase()];
      else if (!/^https?:\/\//i.test(url)) {
        return message.reply(`Unknown preset. Try: **${Object.keys(PRESETS).join(', ')}**`);
      }

      const status = await message.reply('Joining and starting radio\u2026');
      try {
        await music.connect(voice, message.channel);
        music.enableRadio(message.guild.id, url);
        return status.edit({
          content: null,
          embeds: [new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle('24/7 Radio On')
            .setDescription(`Playing in **${voice.name}**\n\`${url.slice(0, 100)}\``)]
        });
      } catch (err) {
        console.error('[radio start]', err);
        return status.edit(`Failed: ${err.message}`);
      }
    }

    if (sub === 'stop') {
      music.disableRadio(message.guild.id);
      music.stop(message.guild.id);
      return message.reply('Radio stopped.');
    }

    if (sub === 'bind') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('You need **Manage Server**.');
      }
      const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]) ||
        message.member?.voice?.channel;
      if (!channel || (channel.type !== ChannelType.GuildVoice && channel.type !== 2)) {
        return message.reply('Join a voice channel first, then `radio bind lofi`');
      }
      const afterBind = args.slice(1);
      let rest = afterBind;
      if (message.mentions.channels.size || /^\d{17,20}$/.test(afterBind[0] || '')) rest = afterBind.slice(1);
      let url = rest.join(' ').trim() || PRESETS.lofi;
      if (PRESETS[url.toLowerCase()]) url = PRESETS[url.toLowerCase()];
      if (!/^https?:\/\//i.test(url)) {
        return message.reply(`Unknown preset. Try: ${Object.keys(PRESETS).join(', ')}`);
      }
      music.setRadioChannel(message.guild.id, channel.id, url);
      return message.reply(`Bound to **${channel.name}**. Radio will start there after bot restart.`);
    }

    if (sub === 'status') {
      const session = music.getSession(message.guild.id);
      const cfg = music.getRadioConfig(message.guild.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('Radio Status')
          .addFields(
            { name: 'Playing', value: session?.current ? 'Yes' : 'No', inline: true },
            { name: '24/7', value: session?.radio || cfg.radio ? 'On' : 'Off', inline: true },
            { name: 'Channel', value: cfg.voiceChannelId ? `<#${cfg.voiceChannelId}>` : '\u2014', inline: true }
          )]
      });
    }

    return message.reply('Use `radio help`.');
  }
};
