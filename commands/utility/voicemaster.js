const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
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
            'They can lock, unlock, ghost, and manage it with buttons.'
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

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('vm_lock').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('vm_unlock').setEmoji('🔓').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('vm_ghost').setEmoji('👻').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('vm_reveal').setEmoji('👁').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('vm_disconnect').setEmoji('🔌').setStyle(ButtonStyle.Danger)
    );

    await interfaceChannel.send({
      embeds: [new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('VoiceMaster Controls')
        .setDescription('🔒 Lock • 🔓 Unlock • 👻 Ghost • 👁 Reveal • 🔌 Disconnect')
      ],
      components: [row]
    });

    const data = getData();
    data[message.guild.id] = { hub: hub.id, category: category.id, interface: interfaceChannel.id };
    saveData(data);

    return message.reply('✅ VoiceMaster set up.');
  }
};
