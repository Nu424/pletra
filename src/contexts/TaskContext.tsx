import { createContext, ReactNode, useContext, useReducer, useEffect } from 'react';
import { Task } from '../types';
import { useStorageService } from './StorageContext';

// アクションタイプ
type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'LOAD_TASKS'; payload: Task[] };

// コンテキスト型
interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
}

// コンテキスト作成
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// リデューサー
function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [
        ...state,
        {
          ...action.payload,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
      ];
    case 'UPDATE_TASK':
      return state.map((task) =>
        task.id === action.payload.id ? action.payload : task
      );
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload.id);
    case 'LOAD_TASKS':
      return action.payload;
    default:
      return state;
  }
}

// プロバイダーコンポーネント
export function TaskProvider({ children }: { children: ReactNode }) {
  const storageService = useStorageService();
  const [tasks, dispatch] = useReducer(taskReducer, [], () => {
    // 初期化時にストレージからタスクを読み込む
    return storageService.loadTasks();
  });

  // タスク変更時にストレージに保存
  useEffect(() => {
    storageService.saveTasks(tasks);
  }, [tasks, storageService]);

  // コンテキスト値
  const value = {
    tasks,
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) =>
      dispatch({ type: 'ADD_TASK', payload: task }),
    updateTask: (task: Task) => dispatch({ type: 'UPDATE_TASK', payload: task }),
    deleteTask: (id: string) => dispatch({ type: 'DELETE_TASK', payload: { id } }),
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// カスタムフック
export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 