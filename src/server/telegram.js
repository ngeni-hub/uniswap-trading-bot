const TelegramBot = require('node-telegram-bot-api');

const { electronDb } = require('./db');

let bot = null;

const config = electronDb.get('config').value();

if (config.telegramBotApi) {
  bot = new TelegramBot(config.telegramBotApi, { polling: true });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === 'subscribe') {
      const cid = electronDb.get('chatIds').find({ id: chatId }).value();
      if (!cid) {
        electronDb.get('chatIds').push({ id: chatId }).write();
      }
      bot.sendMessage(chatId, "Subscribed to the notification.");
    }

    if (msg.text === 'unsubscribe') {
      electronDb.get('chatIds').remove({ id: chatId }).write();
      bot.sendMessage(chatId, "UnSubscribed to the notification.");
    }
  });

  setInterval(() => {
    const notifications = electronDb.get('notifications').value() || [];

    notifications.forEach((notif) => {
      if (notif.sent) return;
      const chatIds = electronDb.get('chatIds').value() || [];
      chatIds.forEach(cid => {
        bot.sendMessage(cid.id, notif.message);
      });

      electronDb
        .get('notifications')
        .find({ id: notif.id })
        .assign({ sent: true })
        .write();
    })

  }, 10000);
}

module.exports = bot;

