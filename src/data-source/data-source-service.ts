import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
// Получаем путь к директории, где находится текущий файл
const __dirname = dirname(__filename);

export class DataSourceService {
  // Previous data snapshot for offline comparing 
  prevFileName = path.join(__dirname, 'prev_data.json');
  // Newest data from last update
  lastFileName = path.join(__dirname, 'last_data.json');
  // File with all founded changes
  changesFileName = path.join(__dirname, 'changes_data.json');

  loadData(fileName: string = this.lastFileName): any[] {
    try {
      if (fs.existsSync(fileName)) {
        const data = fs.readFileSync(fileName, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading last data:', error);
    }
    return [];
  }

  updateSavedData(json: Object) {
    const prevLastData = this.loadData();
    // Save previous latest data to <prevFileName> snapshot
    this.saveDataToFile(prevLastData, this.prevFileName);
    // Rewrite latest data with a new data
    this.saveDataToFile(json, this.lastFileName);
  }

  saveDataToFile(json: Object, fileName: string = this.lastFileName): void {
    try {
      fs.writeFileSync(fileName, JSON.stringify(json, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}
