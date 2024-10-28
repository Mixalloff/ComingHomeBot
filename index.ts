import TelegramBot, { ChatId } from 'node-telegram-bot-api';
// import cron from 'node-cron';
import { ComingHomeIntegrationService } from './src/integration/coming-home-integration-service.js';
import { DataSourceService } from './src/data-source/data-source-service.js';
import { ComingHomeTgBot } from './src/tg-bot/coming-home-tg-bot.js';

// Инициализация Telegram бота
// const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const bot = new ComingHomeTgBot(checkForUpdates);

const comingHomeService = new ComingHomeIntegrationService();
const dataSourceService = new DataSourceService(); 

// Функция для сравнения текущего и предыдущего списка
function compareData(oldData: IApartmentItem[], response: IApartmentsListResponse): string[] {
  const newData = response.data;
  const changes: string[] = [];

  newData.forEach((newItem) => {
    if (!oldData.some((oldItem) => oldItem.cid === newItem.cid)) {
      changes.push(`New apartment: ${ comingHomeService.getApartmentUrl(newItem) }`);
    }
  });

  return changes;
}

// Основная функция
async function checkForUpdates(chatId?: ChatId) {
  const savedData = dataSourceService.loadData() as unknown as IApartmentsListResponse;
  const receivedData = await comingHomeService.fetchData();

  if (!receivedData || receivedData.data.length === 0) {
    console.log('No data received!');
    await bot.notifyChanges([], chatId);
    return;
  }

  const changes = compareData(savedData.data, receivedData);
  await bot.notifyChanges(changes, chatId);

  if (changes.length > 0) {
    dataSourceService.updateSavedData(receivedData);
  } else {
    console.log('Изменений не найдено');
  }
}

// Запускаем задачу каждые 60 минут
// cron.schedule('0 * * * *', () => {
//   console.log('Проверка обновлений...');
//   checkForUpdates();
// });

// Первый запуск
// checkForUpdates();
