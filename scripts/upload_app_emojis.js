#!/usr/bin/env node
// Upload every PNG/GIF/JPG/WEBP in a folder as an application emoji.
// Emoji name = file name without extension. Names that already exist are skipped,
// so this is safe to rerun.
//
// Usage:  node scripts/upload_app_emojis.js [folder]   (default: assets/emojis)
// Token:  read from env TOKEN (same as the bot, .env supported) or VANTA_BOT_TOKEN.
// Requires Node 18+ (global fetch).

const fs = require('fs');
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch {}

const API = 'https://discord.com/api/v10';
const TOKEN = process.env.TOKEN || process.env.VANTA_BOT_TOKEN;
const folder = path.resolve(process.argv[2] || path.join(__dirname, '..', 'assets', 'emojis'));
const MIME = { '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

if (!TOKEN) {
  console.error('Missing bot token: set TOKEN (or VANTA_BOT_TOKEN) in the environment or .env');
  process.exit(1);
}

async function api(method, route, body) {
  for (;;) {
    const res = await fetch(API + route, {
      method,
      headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      await new Promise(r => setTimeout(r, ((data.retry_after || 1) * 1000) + 250));
      continue;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${JSON.stringify(data)}`);
    return data;
  }
}

(async () => {
  const app = await api('GET', '/oauth2/applications/@me');
  console.log(`Application: ${app.name} (${app.id})`);

  const existing = await api('GET', `/applications/${app.id}/emojis`);
  const byName = new Map((existing.items || []).map(e => [e.name, e]));

  const files = fs.readdirSync(folder).filter(f => MIME[path.extname(f).toLowerCase()]).sort();
  let uploaded = 0, skipped = 0, failed = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    if (!/^[A-Za-z0-9_]{2,32}$/.test(name)) {
      console.warn(`skip  ${file}: invalid emoji name`);
      failed++;
      continue;
    }
    if (byName.has(name)) {
      console.log(`skip  ${name} (exists: ${byName.get(name).id})`);
      skipped++;
      continue;
    }
    const image = `data:${MIME[ext]};base64,${fs.readFileSync(path.join(folder, file)).toString('base64')}`;
    try {
      const e = await api('POST', `/applications/${app.id}/emojis`, { name, image });
      console.log(`added ${name} -> ${e.id}`);
      uploaded++;
    } catch (err) {
      console.error(`fail  ${name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`Done: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed.`);
  if (failed) process.exitCode = 1;
})().catch(err => { console.error(err.message); process.exit(1); });
