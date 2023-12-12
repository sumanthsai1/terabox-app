// pages/api/telegramApi.js
import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = '6967803453:AAESYXs9tO8nUazRVLw8dL8h-RozIHjGx80';

export async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const params = {
    chat_id: chatId,
    text,
  };

  try {
    const response = await fetch(`${url}?${new URLSearchParams(params)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    throw error;
  }
}
