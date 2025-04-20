import { Task, Record } from '../types';

// ストレージキー定数
const STORAGE_KEYS = {
  TASKS: 'simple-time-tracker:tasks',
  RECORDS: 'simple-time-tracker:records',
};

// ストレージサービスインターフェース
export interface IStorageService {
  loadTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  loadRecords(): Record[];
  saveRecords(records: Record[]): void;
}

// LocalStorage実装
export class LocalStorageService implements IStorageService {
  loadTasks(): Task[] {
    try {
      const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  loadRecords(): Record[] {
    try {
      const recordsJson = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return recordsJson ? JSON.parse(recordsJson) : [];
    } catch (error) {
      console.error('Error loading records from localStorage:', error);
      return [];
    }
  }

  saveRecords(records: Record[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving records to localStorage:', error);
    }
  }
}

// デフォルトのストレージサービスインスタンス
export const defaultStorageService = new LocalStorageService(); 