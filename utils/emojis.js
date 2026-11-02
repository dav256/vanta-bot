// Application emoji support.
// On ready, `loadAppEmojis(client)` fetches the bot's application emojis
// (uploaded with scripts/upload_app_emojis.js). `emoji(name)` returns the
// app emoji as a string (`<:name:id>`) for embeds/messages, and
// `buttonEmoji(name)` returns a value for ButtonBuilder#setEmoji().
// If an app emoji is missing (not uploaded yet / fetch failed), both fall
// back to the Unicode emoji below, so nothing breaks.

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

const appEmojis = new Map(); // name -> { id, name, animated }

async function loadAppEmojis(client) {
  try {
    if (!client.application) return;
    // discord.js >= 14.16: GET /applications/{app_id}/emojis
    const emojis = await client.application.emojis.fetch();
    appEmojis.clear();
    for (const e of emojis.values()) {
      appEmojis.set(e.name, { id: e.id, name: e.name, animated: Boolean(e.animated) });
    }
    console.log(`[Emojis] Loaded ${appEmojis.size} application emoji(s)`);
  } catch (err) {
    console.warn(`[Emojis] Could not fetch application emojis, using Unicode fallbacks: ${err.message}`);
  }
}

// String form for embeds / message content.
function emoji(name) {
  const e = appEmojis.get(name);
  if (e) return `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`;
  return FALLBACKS[name] ?? '';
}

// Value for ButtonBuilder#setEmoji(): { id, name, animated } or a Unicode string.
function buttonEmoji(name) {
  const e = appEmojis.get(name);
  if (e) return { id: e.id, name: e.name, animated: e.animated };
  return FALLBACKS[name];
}

module.exports = { FALLBACKS, loadAppEmojis, emoji, buttonEmoji };
