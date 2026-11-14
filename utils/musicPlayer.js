const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'music.json');

function load() {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const sessions = new Map();

function getSession(guildId) {
  return sessions.get(guildId);
}

function ensureSession(guildId) {
  if (!sessions.has(guildId)) {
    sessions.set(guildId, {
      player: null,
      connection: null,
      queue: [],
      current: null,
      volume: 80,
      radio: false,
      radioUrl: null,
      textChannel: null
    });
  }
  return sessions.get(guildId);
}

function createPlayer(guildId) {
  const session = ensureSession(guildId);
  if (session.player) return session.player;

  const player = createAudioPlayer();
  session.player = player;

  player.on(AudioPlayerStatus.Idle, () => {
    if (session.radio && session.radioUrl) {
      playUrl(guildId, session.radioUrl, true);
      return;
    }
    playNext(guildId);
  });

  player.on('error', (err) => {
    console.error(`[Music] Player error (${guildId}):`, err.message);
    if (session.radio && session.radioUrl) {
      setTimeout(() => playUrl(guildId, session.radioUrl, true), 3000);
    } else {
      playNext(guildId);
    }
  });

  return player;
}

async function connect(voiceChannel, textChannel) {
  const guildId = voiceChannel.guild.id;
  const session = ensureSession(guildId);
  session.textChannel = textChannel;

  let connection = getVoiceConnection(guildId);
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true
    });
    session.connection = connection;

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
        ]);
      } catch {
        connection.destroy();
        sessions.delete(guildId);
      }
    });
  }

  const player = createPlayer(guildId);
  connection.subscribe(player);
  return session;
}

function playUrl(guildId, url, isRadio = false) {
  const session = ensureSession(guildId);
  if (!session.player) createPlayer(guildId);

  try {
    const resource = createAudioResource(url, { inlineVolume: true });
    if (resource.volume) resource.volume.setVolume(session.volume / 100);
    session.current = {
      title: isRadio ? '24/7 Radio' : (url.slice(0, 80) || 'Track'),
      url,
      radio: isRadio
    };
    session.player.play(resource);
    return true;
  } catch (err) {
    console.error('[Music] playUrl failed:', err.message);
    return false;
  }
}

function playNext(guildId) {
  const session = getSession(guildId);
  if (!session) return;

  if (session.radio && session.radioUrl) {
    playUrl(guildId, session.radioUrl, true);
    return;
  }

  const next = session.queue.shift();
  if (!next) {
    session.current = null;
    return;
  }
  playUrl(guildId, next.url, false);
  session.current = next;
}

function enqueue(guildId, track) {
  const session = ensureSession(guildId);
  session.queue.push(track);
  if (!session.current && session.player?.state?.status !== AudioPlayerStatus.Playing) {
    playNext(guildId);
  }
  return session.queue.length;
}

function skip(guildId) {
  const session = getSession(guildId);
  if (!session?.player) return false;
  session.player.stop(true);
  return true;
}

function stop(guildId) {
  const session = getSession(guildId);
  if (!session) return;
  session.queue = [];
  session.radio = false;
  session.radioUrl = null;
  session.current = null;
  session.player?.stop(true);
  const conn = getVoiceConnection(guildId);
  if (conn) conn.destroy();
  sessions.delete(guildId);
}

function pause(guildId) {
  const session = getSession(guildId);
  if (!session?.player) return false;
  session.player.pause();
  return true;
}

function resume(guildId) {
  const session = getSession(guildId);
  if (!session?.player) return false;
  session.player.unpause();
  return true;
}

function setVolume(guildId, vol) {
  const session = ensureSession(guildId);
  session.volume = Math.max(0, Math.min(100, vol));
  return session.volume;
}

function enableRadio(guildId, url) {
  const session = ensureSession(guildId);
  session.radio = true;
  session.radioUrl = url;
  session.queue = [];
  playUrl(guildId, url, true);

  const data = load();
  data[guildId] = data[guildId] || {};
  data[guildId].radioUrl = url;
  data[guildId].radio = true;
  save(data);
}

function disableRadio(guildId) {
  const session = getSession(guildId);
  if (session) {
    session.radio = false;
    session.radioUrl = null;
  }
  const data = load();
  if (data[guildId]) {
    data[guildId].radio = false;
    save(data);
  }
}

function getRadioConfig(guildId) {
  const data = load();
  return data[guildId] || {};
}

function setRadioChannel(guildId, channelId, url) {
  const data = load();
  data[guildId] = data[guildId] || {};
  data[guildId].voiceChannelId = channelId;
  data[guildId].radioUrl = url;
  data[guildId].radio = true;
  save(data);
}

module.exports = {
  connect,
  enqueue,
  playUrl,
  playNext,
  skip,
  stop,
  pause,
  resume,
  setVolume,
  enableRadio,
  disableRadio,
  getSession,
  getRadioConfig,
  setRadioChannel,
  load,
  save
};
