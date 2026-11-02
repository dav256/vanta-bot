#!/usr/bin/env node
// Check that every alias in utils/emojis.js points to an application emoji that exists.
// Usage: node scripts/verify_emoji_aliases.js   (token from env TOKEN / .env or VANTA_BOT_TOKEN)
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch {}
const { ALIASES, FALLBACKS } = require('../utils/emojis');

const TOKEN = process.env.TOKEN || process.env.VANTA_BOT_TOKEN;
if (!TOKEN) { console.error('Missing TOKEN / VANTA_BOT_TOKEN'); process.exit(1); }

const get = async (route) => {
  const res = await fetch('https://discord.com/api/v10' + route, { headers: { Authorization: `Bot ${TOKEN}` } });
  if (!res.ok) throw new Error(`GET ${route} -> ${res.status}`);
  return res.json();
};

(async () => {
  const app = await get('/oauth2/applications/@me');
  const { items } = await get(`/applications/${app.id}/emojis`);
  const names = new Set(items.map(e => e.name));
  const missing = [];
  for (const [alias, [name]] of Object.entries(ALIASES)) if (!names.has(name)) missing.push(`${alias} -> ${name}`);
  for (const name of Object.keys(FALLBACKS)) if (!names.has(name)) missing.push(`(bleed) ${name}`);
  const used = new Set([...Object.values(ALIASES).map(a => a[0]), ...Object.keys(FALLBACKS)]);
  const unused = [...names].filter(n => !used.has(n)).sort();
  console.log(`App emojis: ${names.size}, aliases: ${Object.keys(ALIASES).length}, mapped app emojis: ${[...used].filter(n => names.has(n)).length}`);
  console.log(`Unmapped app emojis (${unused.length}): ${unused.join(', ') || 'none'}`);
  if (missing.length) { console.error(`MISSING (${missing.length}):\n  ${missing.join('\n  ')}`); process.exit(1); }
  console.log('All aliases resolve to existing app emojis.');
})().catch(err => { console.error(err.message); process.exit(1); });
