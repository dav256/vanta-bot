// Application emoji support.
//
// On ready, `loadAppEmojis(client)` fetches all of the bot's application emojis
// (GET /applications/{app_id}/emojis via client.application.emojis.fetch()).
//
//   emoji(key)       -> string for embeds/messages, e.g. "<:8508delete:123>"
//   buttonEmoji(key) -> value for ButtonBuilder#setEmoji() / select menu options
//
// `key` can be:
//   1. a semantic alias from ALIASES below (e.g. 'success', 'delete', 'ticket'),
//   2. a raw app emoji name (e.g. 'lock', '8508delete'),
//   3. a raw name without its numeric prefix (e.g. 'delete' -> '8508delete').
// When the app emoji is missing (not uploaded / fetch failed) the Unicode
// fallback is returned, so nothing breaks.
//
// Style rule for duplicates/variants: prefer the white-on-dark ("white") set,
// e.g. 2529memberwhite, 3041ownerwhite, 5847staffwhite, 3259moderatorwhite.

// Bleed interface icons (raw names) and their Unicode fallbacks.
const FALLBACKS = {
  activity: '🎮',
  claim: '👑',
  decrease: '➖',
  disconnect: '🔌',
  ghost: '👻',
  increase: '➕',
  information: 'ℹ️',
  lock: '🔒',
  reveal: '👁️',
  unlock: '🔓'
};

// alias -> [app emoji name, Unicode fallback]
const ALIASES = {
  // Status / feedback
  success: ['6422verifiedwhite', '✅'],
  error: ['4431dndblank', '❌'],
  warn: ['1183announcementattention', '⚠️'],
  blocked: ['4431dndblank', '🚫'],
  info: ['information', 'ℹ️'],
  help: ['3936faqbadge', '❓'],

  // Actions
  add: ['1906add', '➕'],
  delete: ['8508delete', '🗑️'],
  edit: ['3236edit', '✏️'],
  copy: ['2854copy', '📋'],
  upload: ['2050upload', '📤'],
  share: ['9199share', '↪️'],
  settings: ['6576settings', '⚙️'],
  search: ['4322search', '🔍'],
  link: ['7957link', '🔗'],
  pinned: ['6362pinned', '📌'],
  summary: ['2137summary', '📝'],
  stats: ['1423statistics', '📊'],
  slowmode: ['8045slowmode', '⏱️'],

  // Server / channels
  server: ['4474homebadge', '🏠'],
  guide: ['1316serverguide', '🪧'],
  channel: ['1710channel', '#️⃣'],
  channels_roles: ['1710channelsandroles', '#️⃣'],
  thread: ['7476threadbadge', '🧵'],
  forum: ['9896forum', '💬'],
  public: ['7656public', '🌐'],
  discovery: ['8561discovery', '🧭'],
  rules: ['7232rules', '📜'],
  announcement: ['1701announcement', '📢'],
  event: ['6334event', '📅'],
  event_add: ['1132eventadd', '📅'],
  emoji: ['5583emoji', '😀'],
  reaction: ['95457voicereaction', '😀'],
  sticker: ['9317sticker', '🏷️'],
  media: ['2982media', '🖼️'],
  media_add: ['7291mediaadd', '🖼️'],
  gif: ['2259gif', '🎞️'],
  clip: ['1680clipwhite', '🎬'],
  location: ['4014location', '📍'],
  shop: ['47531shopwhite', '🛍️'],

  // People / roles / badges
  member: ['2529memberwhite', '👤'],
  invite: ['53540voiceinvite', '📨'],
  owner: ['3041ownerwhite', '👑'],
  staff: ['5847staffwhite', '🛠️'],
  moderator: ['3259moderatorwhite', '🛡️'],
  admin: ['8822adminbadgewhiteblack', '🛡️'],
  shield: ['8822adminbadgewhiteblack', '🛡️'],
  manager: ['4307managerwhite', '⭐'],
  developer: ['1706developerwhite', '💻'],
  bot: ['7721botbadge', '🤖'],
  verified: ['2572verifiedbadge', '☑️'],
  partner: ['9619parneredbadge', '🤝'],
  star: ['2233subscriberbadge', '⭐'],
  boost: ['9520boosterwhite', '💎'],
  boost_level1: ['24995serverboostlevel1alt', '💎'],
  boost_level2: ['67284serverboostlevel2alt', '💎'],
  boost_level3: ['39561serverboostlevel3alt', '💎'],

  // Presence
  online: ['1514onlineblank', '🟢'],
  idle: ['5204idleblank', '🌙'],
  dnd: ['4431dndblank', '⛔'],
  offline: ['6610invisibleofflineblank', '⚫'],

  // Moderation
  ban: ['disconnect', '🔨'], // Bleed's gavel icon
  kick: ['13622voicepopout', '👢'],
  mute: ['43295voicemicrophonemuted', '🔇'],
  timeout: ['8045slowmode', '⏱️'],
  jail: ['9719lock', '⛓️'],
  case: ['2137summary', '📝'],
  modlog: ['2137summary', '📝'],
  restrict: ['9719lock', '🔒'],
  snipe: ['4322search', '🔍'],

  // Systems
  ticket: ['7476threadbadge', '🎫'],
  giveaway: ['7375gift', '🎉'],
  gift: ['7375gift', '🎁'],
  music: ['9509music', '🎵'],
  welcome: ['53540voiceinvite', '👋'],
  goodbye: ['13622voicepopout', '👋'],
  level: ['2233subscriberbadge', '🎉'],
  coins: ['47531shopwhite', '💰'],
  daily: ['6334event', '📅'],
  pay: ['9199share', '💸'],
  ping: ['28587voiceconnectiongreen', '📶'],
  fun: ['8688gaming', '🎱'],
  gaming: ['8688gaming', '🎮'],
  autoresponder: ['9896forum', '💬'],
  voicemaster: ['6458voicechannel', '🎤'],

  // Voice
  voice: ['6458voicechannel', '🔊'],
  voice_mute: ['43295voicemicrophonemuted', '🔇'],
  voice_unmute: ['43295voicemicrophone', '🎙️'],
  voice_deafen: ['8945voiceheadphonesdeafened', '🔇'],
  voice_undeafen: ['8945voiceheadphones', '🎧'],
  voice_server_deafen: ['40983voiceheadphonesserverdeafen', '🔇'],
  voice_suppressed: ['26444voicemicrophonesuppressed', '🎙️'],
  voice_disconnect: ['6730voicedisconnect', '📴'],
  voice_video: ['6730voicevideo', '📹'],
  voice_video_off: ['97219voicevideodisabled', '📹'],
  voice_screenshare: ['82709voicescreenshare', '🖥️'],
  voice_screenshare_end: ['38931voicescreenshareend', '🖥️'],
  voice_locked: ['94393voicechannellockedgreenalt', '🔒'],
  voice_limited: ['90026voicechannellimitedgreenalt', '👥'],
  voice_stage: ['4653stagechannel', '🎙️'],
  voice_soundboard: ['54627voicesoundboard', '🔉'],
  voice_call: ['33054voicecall', '📞'],
  voice_volume_muted: ['48674voicevolumemuted', '🔇'],
  voice_activity: ['13622voiceactivity', '🚀'],
  voice_noise_suppression: ['95457voicenoisesuppression', '〰️'],
  voice_connection: ['28587voiceconnectiongreen', '📶'],
  voice_connection_bad: ['11305voiceconnectionred', '📶'],

  // Socials / categories
  youtube: ['2911youtubebadge', '▶️'],
  twitter: ['9718twitterbadge', '🐦'],
  instagram: ['6753instagrambadge', '📷'],
  tiktok: ['992633tiktok2', '🎵'],
  snapchat: ['8816snapchat', '👻'],
  education: ['7956education', '🎓'],
  entertainment: ['3542entertainment', '📺'],
  science: ['2483scienceandtech', '⚛️'],
  student_hub: ['5269studenthub', '🏫'],

  // Variants (colour / badge / alt versions). Not wired into commands by default;
  // available so every app emoji has a semantic key.
  voice_connection_orange: ['11305voiceconnectionorange', '📶'],
  voice_connection_orange_alt: ['20113voiceconnectionorangealt', '📶'],
  voice_connection_green_alt: ['28587voiceconnectiongreenalt', '📶'],
  voice_connection_red2: ['52298voiceconnectionred2', '📶'],
  voice_connection_red2_alt: ['32772voiceconnectionred2alt', '📶'],
  voice_connection_red_alt: ['99049voiceconnectionredalt', '📶'],
  voice_connection_none: ['92962voiceconnectionnone', '📶'],
  staff_badge: ['1157whitestaffbadge', '🛠️'],
  staff_badge_alt: ['3357whiteblackstaffbadge', '🛠️'],
  staff_black: ['6325staffblack', '🛠️'],
  owner_badge: ['1762whiteownerbadge', '👑'],
  owner_badge_alt: ['1205whiteblackownerbadge', '👑'],
  owner_yellow: ['9137owneryellow', '👑'],
  owner_blue: ['7879darkblueownerbadge', '👑'],
  developer_green: ['1346developergreen', '💻'],
  developer_blue: ['4461developerblue', '💻'],
  bot_developer: ['1763botdeveloperbadge', '🤖'],
  manager_blue: ['1949managerblue', '⭐'],
  moderator_blue: ['5387moderatorblue', '🛡️'],
  member_white_alt: ['3124memberwhite', '👤'],
  member_white_black: ['3124memberwhiteblack', '👤'],
  member_pink: ['6902memberpink', '👤'],
  member_blue: ['9124memberdarkblue', '👤'],
  event_badge: ['1483eventbadge', '📅'],
  events_badge: ['1625eventsbadge', '📅'],
  events_blue: ['3330eventsblue', '📅'],
  events_white: ['9351eventswhite', '📅'],
  forum_badge: ['1483forumbadge', '💬'],
  stage_badge: ['1591stagebadge', '🎙️'],
  voice_badge: ['2911voicebadge', '🔊'],
  announcement_badge: ['2121announcementbadge', '📢'],
  rules_badge: ['2229rulesbadge', '📜'],
  guide_badge: ['7567serverguidebadge', '🪧'],
  info_badge: ['5288informationbadge', 'ℹ️'],
  music_badge: ['9815musicbadge', '🎵'],
  deafened_badge: ['6519deafenedbadge', '🔇'],
  slowmode_badge: ['1569slowmodebadge', '⏱️'],
  booster_badge: ['2292boosterbadge', '💎'],
  verified_check: ['524689verified', '✅'],
  verified_x: ['552821xverified', '✅'],
  pinned_alt: ['5583pinned', '📌'],
  idle_gray: ['2700idlegray', '🌙'],
  voice_channel_green: ['24204voicechannelgreen', '🔊'],
  voice_channel_green_alt: ['15830voicechannelgreenalt', '🔊'],
  voice_stage_green: ['71905voicestagegreenalt', '🎙️'],
  voice_fullscreen: ['25890voicefullscreen', '⛶'],
  voice_fullscreen_exit: ['22374voicefullscreenexit', '⛶'],
  voice_volume_lower: ['30269voicevolumelower', '🔉'],
  voice_noise_suppression_off: ['37254voicenoisesuppressionoff', '〰️'],
  voice_screenshare_server: ['38931voicescreenshareserver', '🖥️'],
  voice_server_deafen_alt: ['40983voiceheadphonessercerdeafen', '🔇'],
  voice_deafen_alt: ['50050voiceheadphonesdeafenedalt', '🔇'],
  voice_mute_alt: ['59959voicemicrophonemutedalt', '🔇'],
  voice_suppressed_alt: ['67314voicemicrophonesuppressedal', '🎙️'],
  voice_clip: ['54627voiceclip', '🎬'],
  boost_1month: ['14074serverboost1monthalt', '💎'],
  boost_2months: ['54610serverboost2monthsalt', '💎'],
  boost_3months: ['35966serverboost3monthsalt', '💎'],
  boost_6months: ['37397serverboost6monthsalt', '💎'],
  boost_9months: ['78011serverboost9monthsalt', '💎'],
  boost_12months: ['19677serverboost12monthsalt', '💎'],
  boost_15months: ['52084serverboost15monthsalt', '💎'],
  boost_18months: ['67284serverboost18monthsalt', '💎'],
  boost_24months: ['9471serverboost24monthsalt', '💎']
};

const appEmojis = new Map(); // exact name -> { id, name, animated }
const stripped = new Map(); // name without numeric prefix -> first match (sorted)

async function loadAppEmojis(client) {
  try {
    if (!client.application) return;
    const emojis = await client.application.emojis.fetch();
    appEmojis.clear();
    stripped.clear();
    const list = [...emojis.values()].sort((a, b) => a.name.localeCompare(b.name));
    for (const e of list) {
      const entry = { id: e.id, name: e.name, animated: Boolean(e.animated) };
      appEmojis.set(e.name, entry);
      const bare = e.name.replace(/^\d+/, '');
      if (bare && bare !== e.name && !stripped.has(bare)) stripped.set(bare, entry);
    }
    console.log(`[Emojis] Loaded ${appEmojis.size} application emoji(s)`);
  } catch (err) {
    console.warn(`[Emojis] Could not fetch application emojis, using Unicode fallbacks: ${err.message}`);
  }
}

function resolve(key) {
  const alias = ALIASES[key];
  const e = (alias && appEmojis.get(alias[0])) || appEmojis.get(key) || stripped.get(key);
  const fallback = alias ? alias[1] : (FALLBACKS[key] ?? '');
  return { e, fallback };
}

// String form for embeds / message content.
function emoji(key) {
  const { e, fallback } = resolve(key);
  if (e) return `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`;
  return fallback;
}

// Value for ButtonBuilder#setEmoji() / StringSelectMenuOptionBuilder#setEmoji().
function buttonEmoji(key) {
  const { e, fallback } = resolve(key);
  if (e) return { id: e.id, name: e.name, animated: e.animated };
  return fallback;
}

module.exports = { FALLBACKS, ALIASES, loadAppEmojis, emoji, buttonEmoji };
