# Vanta Bot

Discord.js v14 multipurpose bot inspired by Greed and Bleed.

## Commands

### Moderation
- `!ban @user [reason]`
- `!kick @user [reason]`
- `!warn @user [reason]`
- `!timeout @user <duration> [reason]` (e.g. 10m, 1h)

### Utility
- `!embed {title: Hello} {description: World}` — Create custom embeds with variables
- `!emojis` — List server emojis

### Economy
- `!balance`
- `!daily`
- `!pay @user amount`

### Fun
- `!hug @user`

### Embed Script Variables
- `{user.mention}`, `{user.tag}`, `{user.avatar}`
- `{guild.name}`, `{guild.count}`, `{guild.icon}`

More features (welcome, giveaways, tickets, reaction roles, starboard, etc.) coming soon.

## Setup
1. npm install
2. Create .env with TOKEN and PREFIX
3. node index.js

## Application emojis
Vanta uses application emojis (VoiceMaster interface, tickets, etc.) and falls back to Unicode when they are missing.
- Icons live in `assets/emojis/` (file name = emoji name: activity, claim, decrease, disconnect, ghost, increase, information, lock, reveal, unlock).
- Upload them once (skips names that already exist, safe to rerun): `npm run upload-emojis` or `node scripts/upload_app_emojis.js [folder]` (uses `TOKEN` from `.env`/env).
- On startup the bot fetches its application emojis by name (`utils/emojis.js`: `emoji(name)` for text, `buttonEmoji(name)` for buttons).
- All 167 app emojis have semantic aliases in `utils/emojis.js` (`success`, `error`, `warn`, `delete`, `ticket`, `voice_mute`, ...); raw names (`8508delete`) and names without the numeric prefix (`delete`) also work. Check aliases against the live app with `npm run verify-emojis`.
- Re-run `!voicemaster setup` to post the new 10-button interface.
