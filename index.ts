import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import TelegramBot from 'node-telegram-bot-api';
// import cron from 'node-cron';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as config from './app.config.json' assert { type: 'json' };

interface IApartmentsListResponse {
  data: IApartmentItem[],
  meta: any,
}

interface IApartmentMedia {
  imagekit: string[];
  vr: {
    id: string;
  };
}

interface IApartmentItem {
  available: boolean;
  availableByArrangement: boolean;
  availableFrom: string; // yyyy-mm-dd
  availableTo: string | null;
  baths: string;
  bedrooms: string;
  cid:string;
  city: string;
  cityHandles: string[];
  district: string;
  districtHandles: string[]; 
  extraHandles: string[];
  handle: string;
  latitudeObfuscated: number;
  longitudeObfuscated: number;
  media: IApartmentMedia;
  neighborhood: string;
  neighborhoodHandles: string[];
  order: string;
  periodMin: string;
  personsMax: number;
  postCode: string;
  published: boolean;
  rent: number;
  rooms: string;
  squaremeter: number;
  street: string;
  subtitle: string;
  title: string;
  transportHandles: string[] | null;
  oldCid?: string;
}

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
// Получаем путь к директории, где находится текущий файл
const __dirname = dirname(__filename);

// Конфигурация
const {API_URL, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, AUTHORIZATION_COMING_HOME_STRING} = config.default;
const DATA_FILE = path.join(__dirname, 'last_data.json');

// Инициализация Telegram бота
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Функция для запроса данных с API
async function fetchData(): Promise<IApartmentsListResponse | null> {
  const encodedAuth = Buffer.from(AUTHORIZATION_COMING_HOME_STRING).toString('base64');
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Basic ${encodedAuth}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.statusText}`);
    }
    return await response.json() as any;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Функция для загрузки последнего сохраненного списка
function loadLastData(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading last data:', error);
  }
  return [];
}

// Функция для сохранения нового списка на диск
function saveData({data}: IApartmentsListResponse): void {
  const savedData = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(savedData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Функция для сравнения текущего и предыдущего списка
function compareData(oldData: IApartmentItem[], response: IApartmentsListResponse): string[] {
  const newData = response.data;
  const changes: string[] = [];

  // Поиск новых элементов
  newData.forEach((newItem) => {
    if (!oldData.some((oldItem) => oldItem.cid === newItem.cid)) {
      changes.push(`Новый объект: https://www.coming-home.com/en/living/${newItem.cid}`);
    }
  });

  // Поиск удаленных элементов
  oldData.forEach((oldItem) => {
    if (!newData.some((newItem) => newItem.cid === oldItem.cid)) {
      changes.push(`Удален объект: https://www.coming-home.com/en/living/${oldItem.cid}`);
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
  const lastData = loadLastData();
  const currentData = await fetchData();

  if (!currentData || currentData.data.length === 0) {
    console.log('Нет данных для обработки');
    return;
  }

  const changes = compareData(lastData, currentData);

  if (changes.length > 0) {
    notifyChanges(changes);
    saveData(currentData);
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
