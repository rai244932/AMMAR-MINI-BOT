/**
 * Auto-React Command - Configure automatic reactions
 */

const { load, save } = require('../../utils/autoReact');

module.exports = {
  name: 'autoreact',
  aliases: ['ar'],
  category: 'owner',
  description: 'Configure automatic reactions to messages',
  usage: '.autoreact <on/off/set bot/set all>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        return extra.reply('ðŸ“‹ *Auto-React Options:*\n\nâ€¢ on - Enable auto-react\nâ€¢ off - Disable auto-react\nâ€¢ set bot - React only to bot commands\nâ€¢ set all - React to all messages');
      }

      const db = load();
      const opt = args.join(' ').toLowerCase();

      if (opt === 'on') {
        db.enabled = true;
        save(db);
        return extra.reply('âœ… Auto-react enabled.');
      }

      if (opt === 'off') {
        db.enabled = false;
        save(db);
        return extra.reply('âŒ Auto-react disabled.');
      }

      if (opt === 'set bot') {
        db.mode = 'bot';
        save(db);
        return extra.reply('ðŸ¤– Auto-react mode: Bot commands only (â³ reaction)');
      }

      if (opt === 'set all') {
        db.mode = 'all';
        save(db);
        return extra.reply('ðŸŒŸ Auto-react mode: All messages (random emojis)');
      }

      extra.reply('âŒ Invalid option. Use: on | off | set bot | set all');
    } catch (err) {
      console.error('[autoreact cmd] error:', err);
      extra.reply('âŒ Error configuring auto-react.');
    }
  }
};
