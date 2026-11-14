const music = require('../utils/musicPlayer');

module.exports = (client) => {
  client.once('ready', async () => {
    setTimeout(async () => {
      const data = music.load();
      for (const [guildId, cfg] of Object.entries(data)) {
        if (!cfg.radio || !cfg.voiceChannelId || !cfg.radioUrl) continue;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        const channel = guild.channels.cache.get(cfg.voiceChannelId);
        if (!channel) continue;

        try {
          await music.connect(channel, null);
          music.enableRadio(guildId, cfg.radioUrl);
          console.log(`[Music] 24/7 radio started in ${guild.name} / ${channel.name}`);
        } catch (err) {
          console.warn(`[Music] Failed radio for ${guildId}:`, err.message);
        }
      }
    }, 5000);
  });
};
