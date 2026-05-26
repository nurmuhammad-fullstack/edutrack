require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const MINI_APP_URL = process.env.MINI_APP_URL;

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'EduTrack ga xush kelibsiz! 📚\nRo\'yxatdan o\'tish uchun tugmani bosing:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📝 Ro\'yxatdan o\'tish',
          web_app: { url: MINI_APP_URL },
        },
      ]],
    },
  });
});

async function notifyStudent(telegramId, status) {
  const messages = {
    active: '✅ Tabriklaymiz! Arizangiz tasdiqlandi. Endi o\'quvchisiz!',
    rejected: '❌ Afsuski, arizangiz rad etildi. Qo\'shimcha ma\'lumot uchun o\'qituvchi bilan bog\'laning.',
  };
  const text = messages[status];
  if (!text) return;
  try {
    await bot.sendMessage(telegramId, text);
  } catch (err) {
    console.error(`Bot xabar yuborishda xato (${telegramId}):`, err.message);
  }
}

module.exports = { bot, notifyStudent };
