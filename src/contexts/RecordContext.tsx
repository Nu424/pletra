import { createContext, ReactNode, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Record } from '../types';
import { useStorageService } from './StorageContext';

// アクションタイプ
type RecordAction =
  | { type: 'SELECT_TASK'; payload: { taskId: string } }
  | { type: 'START_RECORD' }
  | { type: 'PAUSE_RECORD'; payload: { accumulated: number } }
  | { type: 'RESUME_RECORD' }
  | { type: 'COMPLETE_RECORD'; payload: { accumulated: number } }
  | { type: 'CANCEL_RECORD' }
  | { type: 'DESELECT_TASK' }
  | { type: 'UPDATE_RECORD'; payload: Record }
  | { type: 'DELETE_RECORD'; payload: { id: string } }
  | { type: 'LOAD_RECORDS'; payload: Record[] }
  | { type: 'UPDATE_ACCUMULATED'; payload: { accumulated: number } };

// 状態型
interface RecordState {
  records: Record[];
  activeRecordId?: string;
}

// コンテキスト型
interface RecordContextType extends RecordState {
  startRecord: () => void;
  pauseRecord: (accumulated: number) => void;
  resumeRecord: () => void;
  completeRecord: (accumulated: number) => void;
  cancelRecord: () => void;
  updateRecord: (record: Record) => void;
  deleteRecord: (id: string) => void;
  selectTask: (taskId: string) => void;
  deselectTask: () => void;
  activeRecord: Record | undefined;
}

// コンテキスト作成
const RecordContext = createContext<RecordContextType | undefined>(undefined);

// リデューサー
function recordReducer(state: RecordState, action: RecordAction): RecordState {
  switch (action.type) {
    case 'SELECT_TASK': {
      // 既存のアクティブレコードがある場合は先に完了する
      if (state.activeRecordId) {
        return {
          ...state,
          activeRecordId: undefined,
        };
      }

      // 新しいレコードを作成（まだタイマーは開始しない）
      const newRecord: Record = {
        id: uuidv4(),
        taskId: action.payload.taskId,
        startAt: 0,
        accumulated: 0,
      };

      return {
        records: [...state.records, newRecord],
        activeRecordId: newRecord.id,
      };
    }

    case 'START_RECORD': {
      if (!state.activeRecordId) return state;
      
      // 既存のレコードを取得し、タイマーを開始
      return {
        ...state,
        records: state.records.map((record) => 
          record.id === state.activeRecordId
            ? { ...record, startAt: Date.now() }
            : record
        ),
      };
    }

    case 'PAUSE_RECORD': {
      if (!state.activeRecordId) return state;
      
      return {
        ...state,
        records: state.records.map((record) => 
          record.id === state.activeRecordId
            ? { ...record, accumulated: action.payload.accumulated }
            : record
        ),
        // アクティブ状態は維持（解除しない）
      };
    }

    case 'DESELECT_TASK': {
      if (!state.activeRecordId) return state;
      
      // タスクを解除（レコードも削除…startAtが0の空レコードが残っているため）
      return {
        ...state,
        records: state.records.filter((record) => record.id !== state.activeRecordId),
        activeRecordId: undefined,
      };
    }

    case 'RESUME_RECORD': {
      if (!state.activeRecordId) return state;
      
      return {
        ...state,
        records: state.records.map((record) => 
          record.id === state.activeRecordId
            ? { ...record, startAt: Date.now() }
            : record
        ),
      };
    }

    case 'COMPLETE_RECORD': {
      if (!state.activeRecordId) return state;

      return {
        ...state,
        records: state.records.map((record) => 
          record.id === state.activeRecordId
            ? { 
                ...record, 
                accumulated: action.payload.accumulated,
                endAt: Date.now() 
              }
            : record
        ),
        activeRecordId: undefined,
      };
    }

    case 'CANCEL_RECORD': {
      if (!state.activeRecordId) return state;
      
      return {
        ...state,
        records: state.records.filter((record) => record.id !== state.activeRecordId),
        activeRecordId: undefined,
      };
    }

    case 'UPDATE_RECORD':
      return {
        ...state,
        records: state.records.map((record) => 
          record.id === action.payload.id ? action.payload : record
        ),
      };

    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter((record) => record.id !== action.payload.id),
        activeRecordId: state.activeRecordId === action.payload.id 
          ? undefined 
          : state.activeRecordId,
      };

    case 'LOAD_RECORDS':
      return {
        ...state,
        records: action.payload,
      };

    case 'UPDATE_ACCUMULATED': {
      if (!state.activeRecordId) return state;
      
      return {
        ...state,
        records: state.records.map((record) => 
          record.id === state.activeRecordId
            ? { ...record, accumulated: action.payload.accumulated }
            : record
        ),
      };
    }

    default:
      return state;
  }
}

// プロバイダーコンポーネント
export function RecordProvider({ children }: { children: ReactNode }) {
  const storageService = useStorageService();
  const [state, dispatch] = useReducer(recordReducer, { records: [] }, () => {
    // 初期化時にストレージからレコードを読み込む
    const records = storageService.loadRecords();
    
    // アクティブなレコードがあるか確認（endAt が未設定のもの）
    const activeRecord = records.find((record) => !record.endAt);
    
    return {
      records,
      activeRecordId: activeRecord?.id,
    };
  });

  // レコード変更時にストレージに保存
  useEffect(() => {
    storageService.saveRecords(state.records);
  }, [state.records, storageService]);

  // 現在アクティブなレコードを取得
  const activeRecord = state.activeRecordId
    ? state.records.find((record) => record.id === state.activeRecordId)
    : undefined;

  // コンテキスト値
  const value: RecordContextType = {
    ...state,
    activeRecord,
    selectTask: (taskId: string) =>
      dispatch({ type: 'SELECT_TASK', payload: { taskId } }),
    startRecord: () =>
      dispatch({ type: 'START_RECORD' }),
    pauseRecord: (accumulated: number) => 
      dispatch({ type: 'PAUSE_RECORD', payload: { accumulated } }),
    resumeRecord: () => 
      dispatch({ type: 'RESUME_RECORD' }),
    completeRecord: (accumulated: number) => 
      dispatch({ type: 'COMPLETE_RECORD', payload: { accumulated } }),
    cancelRecord: () => 
      dispatch({ type: 'CANCEL_RECORD' }),
    deselectTask: () =>
      dispatch({ type: 'DESELECT_TASK' }),
    updateRecord: (record: Record) => 
      dispatch({ type: 'UPDATE_RECORD', payload: record }),
    deleteRecord: (id: string) => 
      dispatch({ type: 'DELETE_RECORD', payload: { id } }),
  };

  return <RecordContext.Provider value={value}>{children}</RecordContext.Provider>;
}

// カスタムフック
export function useRecordContext(): RecordContextType {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecordContext must be used within a RecordProvider');
  }
  return context;
} 