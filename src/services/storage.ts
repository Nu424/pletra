import { Task, Record, TimerState, TrackingState } from '../types';

// ストレージキー定数
const STORAGE_KEYS = {
  TASKS: 'simple-time-tracker:tasks',
  RECORDS: 'simple-time-tracker:records',
  TIMER: 'simple-time-tracker:timer',
  TRACKING_STATE: 'simple-time-tracker:tracking-state',
};

// ストレージサービスインターフェース
export interface IStorageService {
  loadTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  loadRecords(): Record[];
  saveRecords(records: Record[]): void;
  loadTimer(): TimerState;
  saveTimer(timer: TimerState): void;
  loadTrackingState(): TrackingState;
  saveTrackingState(state: TrackingState): void;
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

  loadTimer(): TimerState {
    try {
      const timerJson = localStorage.getItem(STORAGE_KEYS.TIMER);
      return timerJson ? JSON.parse(timerJson) : { currentTime: 0, fixedTime: 0, isRunning: false };
    } catch (error) {
      console.error('Error loading timer from localStorage:', error);
      return { currentTime: 0, fixedTime: 0, isRunning: false, startTime: 0 };
    }
  }

  saveTimer(timer: TimerState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer));
    } catch (error) {
      console.error('Error saving timer to localStorage:', error);
    }
  }

  loadTrackingState(): TrackingState {
    try {
      const stateJson = localStorage.getItem(STORAGE_KEYS.TRACKING_STATE);
      return stateJson ? JSON.parse(stateJson) : { selectedTaskId: undefined, activeRecordId: undefined };
    } catch (error) {
      console.error('Error loading tracking state from localStorage:', error);
      return { selectedTaskId: undefined, activeRecordId: undefined };
    }
  }

  saveTrackingState(state: TrackingState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKING_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving tracking state to localStorage:', error);
    }
  }
}

// デフォルトのストレージサービスインスタンス
export const defaultStorageService = new LocalStorageService(); 