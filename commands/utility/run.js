const { EmbedBuilder } = require('discord.js');

const langs = {
  javascript: 'js', js: 'js', typescript: 'ts', ts: 'ts',
  python: 'py', py: 'py', java: 'java',
  c: 'c', cpp: 'cpp', 'c++': 'cpp', csharp: 'cs', 'c#': 'cs',
  go: 'go', rust: 'rs', php: 'php', ruby: 'rb',
  html: 'html', css: 'css', json: 'json',
  bash: 'sh', shell: 'sh', sql: 'sql',
  kotlin: 'kt', swift: 'swift', dart: 'dart'
};

module.exports = {
  name: 'run',
  description: 'Run code (language auto-detect)',
  aliases: ['evalcode'],
  async execute(message, args) {
    const text = args.join(' ');
    if (!text) return message.reply('Provide code to run.');

    let lang = 'js';
    let code = text;

    const match = text.match(/^```(\w+)?\n([\s\S]+?)```$/);
    if (match) {
      lang = langs[match[1]?.toLowerCase()] || 'js';
      code = match[2];
    } else if (text.startsWith('```')) {
      code = text.replace(/```\w*\n?|```/g, '');
    }

    if (text.includes('def ') || text.includes('import ') && text.includes('print(')) lang = 'py';
    if (text.includes('function') || text.includes('const ') || text.includes('let ')) lang = 'js';

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle(`Run (${lang})`)
      .setDescription('```' + lang + '\n' + code.slice(0, 1000) + '\n```')
      .setFooter({ text: 'Language auto-detected. Execution requires a runtime.' });

    return message.reply({ embeds: [embed] });
  }
};
