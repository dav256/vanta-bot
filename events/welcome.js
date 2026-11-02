const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/welcome.json');

function getData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const data = getData();
    const config = data[member.guild.id];
    if (!config || !config.channel) return;

    const channel = member.guild.channels.cache.get(config.channel);
    if (!channel) return;

    let text = config.message || 'Welcome {user} to {guild}! You are member #{count}.';
    text = text
      .replace(/{user}/g, member.toString())
      .replace(/{guild}/g, member.guild.name)
      .replace(/{count}/g, member.guild.memberCount);

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setDescription(text)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    channel.send({ embeds: [embed] }).catch(() => {});
  });

  console.log('[Events] Welcome loaded');
};
