import TelegramBot from 'node-telegram-bot-api';
// import cron from 'node-cron';
import { ComingHomeIntegrationService } from './src/integration/coming-home-integration-service.js';
import { DataSourceService } from './src/data-source/data-source-service.js';

// Инициализация Telegram бота
// const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const comingHomeService = new ComingHomeIntegrationService();
const dataSourceService = new DataSourceService(); 

// Функция для сравнения текущего и предыдущего списка
function compareData(oldData: IApartmentItem[], response: IApartmentsListResponse): string[] {
  const newData = response.data;
  const changes: string[] = [];

  // Поиск новых элементов
  newData.forEach((newItem) => {
    if (!oldData.some((oldItem) => oldItem.cid === newItem.cid)) {
      changes.push(`Новый объект: ${ comingHomeService.getApartmentUrl(newItem) }`);
    }
  });

  // Поиск удаленных элементов
  oldData.forEach((oldItem) => {
    if (!newData.some((newItem) => newItem.cid === oldItem.cid)) {
      changes.push(`Удален объект: ${ comingHomeService.getApartmentUrl(oldItem) }`);
    }
  });

  // Поиск изменений в доступности
  // newData.forEach((newItem) => {
  //   const oldItem = oldData.find((item) => item.cid === newItem.cid);
  //   if (oldItem && oldItem.available !== newItem.available) {
  //     const status = newItem.available ? 'доступен' : 'недоступен';
  //     changes.push(`Изменение статуса: ${newItem.title} теперь ${status}`);
  //   }
  // });

  return changes;
}

// Функция для отправки изменений через Telegram
function notifyChanges(changes: string[]): void {
  if (changes.length === 0) {
    console.log('Нет изменений');
    return;
  }

  changes.forEach(changeStr => console.log(changeStr));
  
  // const message = changes.join('\n');
  // bot.sendMessage(TELEGRAM_CHAT_ID, message).then(() => {
  //   console.log('Изменения отправлены через Telegram');
  // }).catch(console.error);
}

// Основная функция
async function checkForUpdates() {
  const savedData = dataSourceService.loadData() as unknown as IApartmentsListResponse;
  const currentData = await comingHomeService.fetchData();

  if (!currentData || currentData.data.length === 0) {
    console.log('Нет данных для обработки');
    return;
  }

  const changes = compareData(savedData.data, currentData);

  if (changes.length > 0) {
    notifyChanges(changes);
    dataSourceService.updateSavedData(currentData);
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
checkForUpdates();
