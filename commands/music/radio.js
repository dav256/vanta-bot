const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const music = require('../../utils/musicPlayer');

const PRESETS = {
  lofi: 'https://streams.ilovemusic.de/iloveradio17.mp3',
  jazz: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3',
  classical: 'https://stream.classicalradio.nl/classicalradio.mp3',
  hits: 'https://streams.ilovemusic.de/iloveradio1.mp3',
  chill: 'https://streams.ilovemusic.de/iloveradio10.mp3'
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
          .setDescription('Keep music playing in a voice channel all day.')
          .addFields(
            { name: 'Start (you in VC)', value: '`radio start [preset|url]`', inline: false },
            { name: 'Presets', value: Object.keys(PRESETS).map(k => `\`${k}\``).join(' \u00b7 '), inline: false },
            { name: 'Custom stream', value: '`radio start https://stream.example.com/live.mp3`', inline: false },
            { name: 'Bind channel', value: '`radio bind #voice [preset|url]` \u2014 auto-join on boot', inline: false },
            { name: 'Stop', value: '`radio stop`', inline: false },
            { name: 'Status', value: '`radio status`', inline: false }
          )
          .setFooter({ text: 'Streams must be direct audio URLs (mp3/aac).' })]
      });
    }

    if (sub === 'start') {
      const voice = message.member?.voice?.channel;
      if (!voice) return message.reply('Join a voice channel first.');

      let url = args.slice(1).join(' ').trim();
      if (!url) url = PRESETS.lofi;
      else if (PRESETS[url.toLowerCase()]) url = PRESETS[url.toLowerCase()];
      else if (!/^https?:\/\//i.test(url)) {
        return message.reply(`Unknown preset. Use: ${Object.keys(PRESETS).join(', ')} or a stream URL.`);
      }

      try {
        await music.connect(voice, message.channel);
        music.enableRadio(message.guild.id, url);
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle('24/7 Radio Started')
            .setDescription(`Playing in **${voice.name}**\n\`${url.slice(0, 120)}\``)]
        });
      } catch (err) {
        return message.reply(`Failed: ${err.message}`);
      }
    }

    if (sub === 'stop') {
      music.disableRadio(message.guild.id);
      music.stop(message.guild.id);
      return message.reply('Radio stopped and left voice.');
    }

    if (sub === 'bind') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('You need **Manage Server**.');
      }
      const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]) ||
        message.member?.voice?.channel;

      if (!channel || channel.type !== ChannelType.GuildVoice) {
        return message.reply('Mention a voice channel or join one: `radio bind #voice lofi`');
      }

      const afterBind = args.slice(1);
      let rest = afterBind;
      if (message.mentions.channels.size || /^\d{17,20}$/.test(afterBind[0] || '')) {
        rest = afterBind.slice(1);
      }
      let url = rest.join(' ').trim() || PRESETS.lofi;
      if (PRESETS[url.toLowerCase()]) url = PRESETS[url.toLowerCase()];
      if (!/^https?:\/\//i.test(url)) {
        return message.reply(`Unknown preset/url. Presets: ${Object.keys(PRESETS).join(', ')}`);
      }

      music.setRadioChannel(message.guild.id, channel.id, url);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFFFFF)
          .setTitle('24/7 Radio Bound')
          .setDescription(`On bot restart, I will join **${channel.name}** and play:\n\`${url.slice(0, 120)}\``)]
      });
    }

    if (sub === 'status') {
      const session = music.getSession(message.guild.id);
      const cfg = music.getRadioConfig(message.guild.id);
      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Radio Status')
        .addFields(
          { name: 'Playing', value: session?.current ? (session.current.title || 'Yes') : 'No', inline: true },
          { name: '24/7 mode', value: session?.radio || cfg.radio ? 'On' : 'Off', inline: true },
          { name: 'Bound channel', value: cfg.voiceChannelId ? `<#${cfg.voiceChannelId}>` : 'None', inline: true },
          { name: 'Stream', value: `\`${(session?.radioUrl || cfg.radioUrl || '\u2014').slice(0, 100)}\``, inline: false }
        );
      return message.reply({ embeds: [embed] });
    }

    return message.reply('Use `radio help`.');
  }
};
