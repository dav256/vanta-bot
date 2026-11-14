const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType,
  entersState,
  getVoiceConnection
} = require('@discordjs/voice');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let ffmpegPath = 'ffmpeg';
try {
  ffmpegPath = require('ffmpeg-static');
} catch {
  /* system ffmpeg */
}

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
      textChannel: null,
      ffmpeg: null
    });
  }
  return sessions.get(guildId);
}

function killFfmpeg(session) {
  if (session?.ffmpeg) {
    try { session.ffmpeg.kill('SIGKILL'); } catch {}
    session.ffmpeg = null;
  }
}

function createPlayer(guildId) {
  const session = ensureSession(guildId);
  if (session.player) return session.player;

  const player = createAudioPlayer();
  session.player = player;

  player.on(AudioPlayerStatus.Idle, () => {
    killFfmpeg(session);
    if (session.radio && session.radioUrl) {
      setTimeout(() => playUrl(guildId, session.radioUrl, true), 1000);
      return;
    }
    playNext(guildId);
  });

  player.on('error', (err) => {
    console.error(`[Music] Player error (${guildId}):`, err.message);
    killFfmpeg(session);
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

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    } catch (err) {
      try { connection.destroy(); } catch {}
      sessions.delete(guildId);
      throw new Error('Could not join voice. Give the bot Connect + Speak.');
    }

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
        ]);
      } catch {
        try { connection.destroy(); } catch {}
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
  killFfmpeg(session);

  try {
    const args = [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', url,
      '-analyzeduration', '0',
      '-loglevel', 'error',
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1'
    ];

    const ff = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    session.ffmpeg = ff;

    ff.stderr.on('data', (chunk) => {
      const msg = chunk.toString().trim();
      if (msg) console.warn('[ffmpeg]', msg.slice(0, 200));
    });

    ff.on('error', (err) => {
      console.error('[ffmpeg spawn]', err.message);
      if (session.textChannel) {
        session.textChannel.send(
          'Music error: FFmpeg missing. Run `npm install ffmpeg-static` then restart.'
        ).catch(() => {});
      }
    });

    const resource = createAudioResource(ff.stdout, {
      inputType: StreamType.Raw,
      inlineVolume: true
    });
    if (resource.volume) resource.volume.setVolume((session.volume || 80) / 100);

    session.current = {
      title: isRadio ? '24/7 Radio' : (url.split('/').pop() || 'Track').slice(0, 80),
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
  const playing = session.player?.state?.status === AudioPlayerStatus.Playing;
  if (!session.current && !playing) playNext(guildId);
  return session.queue.length;
}

function skip(guildId) {
  const session = getSession(guildId);
  if (!session?.player) return false;
  killFfmpeg(session);
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
  killFfmpeg(session);
  session.player?.stop(true);
  const conn = getVoiceConnection(guildId);
  if (conn) { try { conn.destroy(); } catch {} }
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
  return load()[guildId] || {};
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
  connect, enqueue, playUrl, playNext, skip, stop, pause, resume,
  setVolume, enableRadio, disableRadio, getSession, getRadioConfig,
  setRadioChannel, load, save
};
