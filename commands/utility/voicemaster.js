const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const { emoji, buttonEmoji } = require('../../utils/emojis');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/voicemaster.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'voicemaster',
  aliases: ['vm'],
  description: 'Setup join-to-create voice channels',
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub !== 'setup') {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle('🎤 VoiceMaster')
          .setDescription(
            '`!voicemaster setup` — Create the Join to Create channel + interface\n\n' +
            'Members join the hub channel and get their own temporary VC.\n' +
            'They can lock, unlock, ghost, reveal, claim and manage it with the interface buttons.'
          )]
      });
    }

    const category = await message.guild.channels.create({
      name: 'VoiceMaster',
      type: ChannelType.GuildCategory
    });

    const hub = await message.guild.channels.create({
      name: '🎤 Join to Create',
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    const interfaceChannel = await message.guild.channels.create({
      name: 'interface',
      type: ChannelType.GuildText,
      parent: category.id
    });

    const button = (id, name, style = ButtonStyle.Secondary) =>
      new ButtonBuilder().setCustomId(`vm_${id}`).setEmoji(buttonEmoji(name)).setStyle(style);

    const row1 = new ActionRowBuilder().addComponents(
      button('lock', 'lock'),
      button('unlock', 'unlock'),
      button('ghost', 'ghost'),
      button('reveal', 'reveal'),
      button('claim', 'claim')
    );
    const row2 = new ActionRowBuilder().addComponents(
      button('disconnect', 'disconnect', ButtonStyle.Danger),
      button('activity', 'activity'),
      button('information', 'information'),
      button('increase', 'increase'),
      button('decrease', 'decrease')
    );

    await interfaceChannel.send({
      embeds: [new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('VoiceMaster Interface')
        .setDescription(
          'Click the buttons below to control your voice channel.\n\n' +
          `${emoji('lock')} — **Lock** the voice channel\n` +
          `${emoji('unlock')} — **Unlock** the voice channel\n` +
          `${emoji('ghost')} — **Ghost** (hide) the voice channel\n` +
          `${emoji('reveal')} — **Reveal** the voice channel\n` +
          `${emoji('claim')} — **Claim** the voice channel\n` +
          `${emoji('disconnect')} — **Disconnect** from the voice channel\n` +
          `${emoji('activity')} — **Start** an activity\n` +
          `${emoji('information')} — **View** channel information\n` +
          `${emoji('increase')} — **Increase** the user limit\n` +
          `${emoji('decrease')} — **Decrease** the user limit`
        )
      ],
      components: [row1, row2]
    });

    const data = getData();
    data[message.guild.id] = { hub: hub.id, category: category.id, interface: interfaceChannel.id };
    saveData(data);

    return message.reply('✅ VoiceMaster set up.');
  }
};
