import TelegramBot, { ChatId } from 'node-telegram-bot-api';
import * as config from '../../app.config.json' assert { type: 'json' };
import { IApartmentChange } from '../typings/common.js';
const { TELEGRAM_TOKEN } = config.default;

export class ComingHomeTgBot {
  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

  constructor(private onCheckForUpdates: Function) {
    this.subscribeToUpdates();
  }

  createDefaultButtons(chatId: ChatId) {
    return this.bot.sendMessage(chatId, 'Push button below to check for updates', {
        reply_markup: {
            inline_keyboard: [[{ text: 'Check for updates', callback_data: 'check_updates' }]]
        }
    });
  }

  subscribeToUpdates() {
    // Обработчик команды /start и кнопки для проверки обновлений
    this.bot.onText(/\/start/, (msg) => {
      this.createDefaultButtons(msg.chat.id);
    });

    // Обработчик нажатия кнопки "Проверить обновления"
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;

      if (query.data === 'check_updates' && chatId) {
          await this.onCheckForUpdates(chatId);
          await this.createDefaultButtons(chatId);
          this.bot.answerCallbackQuery(query.id);
      }
    });
  }

  // Функция для отправки изменений через Telegram
  async notifyChanges(changes: IApartmentChange[], chatId?: ChatId): Promise<void> {
    const message = changes.length === 0
      ? 'Нет изменений'
      : changes.map(change => this.getApartmentUrl(change.item)).join('\n');
    console.log(message);
    
    if (chatId) {
      if (changes?.length) {
        await Promise.all(
          changes.map(change => this.bot.sendMessage(chatId, this.constructChangeMessage(change)))
        ).catch(console.error);
      } else {
        this.bot.sendMessage(chatId, 'There are no new apartments available!');
      }
    }
  }

  private constructChangeMessage(change: IApartmentChange): string {
    return `
      ${this.getApartmentUrl(change.item)}
      Price: ${ change.item.rent } euro
      ${ change.item.squaremeter } sq.m / ${ change.item.rooms } rooms
      From: ${ change.item.availableFrom }
      ${ [change.item.postCode, change.item.street, change.item.district].filter(Boolean).join(', ') }
    `;
  }

  private getApartmentUrl(apartment: IApartmentItem) {
    return `https://www.coming-home.com/en/living/${apartment.cid}`;
  }
}
