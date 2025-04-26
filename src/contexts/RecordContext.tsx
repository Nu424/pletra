import { createContext, ReactNode, useContext, useReducer, useEffect } from 'react';
import { Record, Task, TrackingState } from '../types';
import { useStorageService } from './StorageContext';
import { useTaskContext } from './TaskContext';

// アクションタイプ
type RecordAction =
  | { type: 'START_RECORD' }
  | { type: 'PAUSE_RECORD'; payload: { accumulated: number } }
  | { type: 'RESUME_RECORD' }
  | { type: 'COMPLETE_RECORD'; payload: { accumulated: number } }
  | { type: 'CANCEL_RECORD' }
  | { type: 'LOAD_RECORDS'; payload: Record[] }
  // HistoryPageでのレコード更新
  | { type: 'UPDATE_RECORD'; payload: Record }
  | { type: 'DELETE_RECORD'; payload: { id: string } }
  // タスクの選択
  | { type: 'SELECT_TASK'; payload: { taskId: string } }
  | { type: 'DESELECT_TASK' }
  | { type: 'UPDATE_ACCUMULATED'; payload: { accumulated: number } };

// 状態型
interface RecordState {
  records: Record[];
  trackingState: TrackingState;
}

// コンテキスト型
interface RecordContextType extends RecordState {
  startRecord: () => void;
  pauseRecord: (accumulated: number) => void;
  resumeRecord: () => void;
  completeRecord: (accumulated: number) => void;
  cancelRecord: () => void;
  // ---HistoryPageでのレコード更新
  updateRecord: (record: Record) => void;
  deleteRecord: (id: string) => void;
  // ---タスクの選択
  selectTask: (taskId: string) => void;
  deselectTask: () => void;
  // ---セットされているTask, 記録中のRecord
  selectedTask: Task | undefined;
  activeRecord: Record | undefined;
}

// コンテキスト作成
const RecordContext = createContext<RecordContextType | undefined>(undefined);

// リデューサー
function recordReducer(state: RecordState, action: RecordAction): RecordState {
  switch (action.type) {
    case 'START_RECORD': {
      if (!state.trackingState.selectedTaskId) return state; // タスクが選択されていない場合は何もしない
      if (state.trackingState.activeRecordId) return state; // 既にアクティブなレコードがある場合は何もしない

      // 新しいレコードを作成
      const newRecord: Record = {
        id: crypto.randomUUID(),
        taskId: state.trackingState.selectedTaskId,
        startAt: Date.now(),
        accumulated: 0,
      };

      // 既存のレコードを取得し、タイマーを開始
      return {
        ...state,
        records: [...state.records, newRecord],
        trackingState: {
          ...state.trackingState,
          activeRecordId: newRecord.id,
        },
      };
    }

    case 'PAUSE_RECORD': {
      if (!state.trackingState.activeRecordId) return state; // アクティブなレコードがない場合は何もしない

      return {
        ...state,
        records: state.records.map((record) =>
          record.id === state.trackingState.activeRecordId
            ? { ...record, accumulated: action.payload.accumulated }
            : record
        ),
        // アクティブ状態は維持（解除しない）
      };
    }

    case 'RESUME_RECORD': {
      if (!state.trackingState.activeRecordId) return state; // アクティブなレコードがない場合は何もしない

      return {
        ...state,
        records: state.records.map((record) =>
          record.id === state.trackingState.activeRecordId
            ? { ...record, startAt: Date.now() }
            : record
        ),
      };
    }

    case 'COMPLETE_RECORD': {
      if (!state.trackingState.activeRecordId) return state; // アクティブなレコードがない場合は何もしない

      return {
        ...state,
        records: state.records.map((record) =>
          record.id === state.trackingState.activeRecordId
            ? {
              ...record,
              accumulated: action.payload.accumulated,
              endAt: Date.now()
            }
            : record
        ),
        trackingState: {
          ...state.trackingState,
          activeRecordId: undefined,
        },
      };
    }

    case 'CANCEL_RECORD': {
      if (!state.trackingState.activeRecordId) return state; // アクティブなレコードがない場合は何もしない

      return {
        ...state,
        records: state.records.filter((record) => record.id !== state.trackingState.activeRecordId),
        trackingState: {
          ...state.trackingState,
          activeRecordId: undefined,
        },
      };
    }

    case 'LOAD_RECORDS':
      return {
        ...state,
        records: action.payload,
      };

    case 'UPDATE_ACCUMULATED': {
      if (!state.trackingState.activeRecordId) return state;

      return {
        ...state,
        records: state.records.map((record) =>
          record.id === state.trackingState.activeRecordId
            ? { ...record, accumulated: action.payload.accumulated }
            : record
        ),
      };
    }

    // ----------
    // ---HistoryPageでのレコード更新 
    // ----------
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
      };

    // ----------
    // ---タスクの選択
    // ----------
    case 'SELECT_TASK': {
      // 既存のアクティブレコードがある場合は先に完了する
      if (state.trackingState.activeRecordId) {
        return {
          ...state,
          trackingState: {
            ...state.trackingState,
            activeRecordId: undefined,
          },
        };
      }

      return {
        ...state,
        trackingState: {
          ...state.trackingState,
          selectedTaskId: action.payload.taskId,
        },
      };
    }

    case 'DESELECT_TASK': {
      if (!state.trackingState.selectedTaskId) return state;

      // タスクを解除（レコードも削除…startAtが0の空レコードが残っているため）
      return {
        ...state,
        trackingState: {
          ...state.trackingState,
          selectedTaskId: undefined,
        },
      };
    }

    default:
      return state;
  }
}

// プロバイダーコンポーネント
export function RecordProvider({ children }: { children: ReactNode }) {
  const storageService = useStorageService();
  const [state, dispatch] = useReducer(recordReducer, { records: [], trackingState: { selectedTaskId: undefined, activeRecordId: undefined } }, () => {
    // ---初期化時にストレージからレコードを読み込む
    const storedRecords = storageService.loadRecords();
    const storedTrackingState = storageService.loadTrackingState();

    return {
      records: storedRecords,
      trackingState: storedTrackingState,
    };
  });

  // レコード変更時にストレージに保存
  useEffect(() => {
    storageService.saveRecords(state.records);
    storageService.saveTrackingState(state.trackingState);
  }, [state.records, state.trackingState, storageService]);

  // ---セットされているTask, 記録中のRecordを取得
  const { tasks } = useTaskContext();
  const selectedTask = tasks.find((task) => task.id === state.trackingState.selectedTaskId);
  const activeRecord = state.records.find((record) => record.id === state.trackingState.activeRecordId);

  // コンテキスト値
  const value: RecordContextType = {
    ...state,
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
    // ---HistoryPageでのレコード更新
    updateRecord: (record: Record) =>
      dispatch({ type: 'UPDATE_RECORD', payload: record }),
    deleteRecord: (id: string) =>
      dispatch({ type: 'DELETE_RECORD', payload: { id } }),
    // ---タスクの選択
    selectTask: (taskId: string) =>
      dispatch({ type: 'SELECT_TASK', payload: { taskId } }),
    deselectTask: () =>
      dispatch({ type: 'DESELECT_TASK' }),
    // ---セットされているTask, 記録中のRecord
    selectedTask,
    activeRecord,
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