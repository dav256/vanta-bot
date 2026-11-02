const { EmbedBuilder } = require('discord.js');

/**
 * Parse a simple embed script into an EmbedBuilder.
 * Supports: {embed}, {title: text}, {description: text}, {color: #hex}, {thumbnail: url}, {image: url}, {footer: text}, {author: name}
 * Also supports variables: {user.mention}, {user.tag}, {user.avatar}, {guild.name}, {guild.count}, {guild.icon}
 */
function parseEmbed(script, context = {}) {
  if (!script || typeof script !== 'string') return null;

  const embed = new EmbedBuilder().setColor(0xFFFFFF);

  // Replace variables
  let processed = script;
  const vars = {
    '{user.mention}': context.user?.toString() || '',
    '{user.tag}': context.user?.tag || '',
    '{user.avatar}': context.user?.displayAvatarURL({ dynamic: true }) || '',
    '{guild.name}': context.guild?.name || '',
    '{guild.count}': context.guild?.memberCount || '',
    '{guild.icon}': context.guild?.iconURL({ dynamic: true }) || ''
  };

  for (const [key, val] of Object.entries(vars)) {
    processed = processed.split(key).join(val);
  }

  // Extract fields
  const titleMatch = processed.match(/\{title:\s*([^}]+)\}/i);
  if (titleMatch) embed.setTitle(titleMatch[1].trim());

  const descMatch = processed.match(/\{description:\s*([^}]+)\}/i);
  if (descMatch) embed.setDescription(descMatch[1].trim());

  const colorMatch = processed.match(/\{color:\s*#?([0-9a-fA-F]{6})\}/i);
  if (colorMatch) embed.setColor(parseInt(colorMatch[1], 16));

  const thumbMatch = processed.match(/\{thumbnail:\s*([^}]+)\}/i);
  if (thumbMatch) embed.setThumbnail(thumbMatch[1].trim());

  const imageMatch = processed.match(/\{image:\s*([^}]+)\}/i);
  if (imageMatch) embed.setImage(imageMatch[1].trim());

  const footerMatch = processed.match(/\{footer:\s*([^}]+)\}/i);
  if (footerMatch) embed.setFooter({ text: footerMatch[1].trim() });

  const authorMatch = processed.match(/\{author:\s*([^}]+)\}/i);
  if (authorMatch) embed.setAuthor({ name: authorMatch[1].trim() });

  return embed;
}

module.exports = { parseEmbed };
