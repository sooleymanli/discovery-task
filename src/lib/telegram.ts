export async function sendTelegramMessage(opts: { chatId?: string; text: string }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts.chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: opts.text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Telegram send error', err);
  }
}


