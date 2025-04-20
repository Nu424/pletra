import { createContext, ReactNode, useContext, useReducer, useEffect } from 'react';

// UI状態型
interface UIState {
  taskModal: {
    open: boolean;
    mode: 'add' | 'edit';
    taskId?: string;
  };
  recordModal: {
    open: boolean;
    recordId?: string;
  };
  theme: 'light' | 'dark';
}

// アクションタイプ
type UIAction =
  | { type: 'OPEN_TASK_MODAL'; payload: { mode: 'add' | 'edit'; taskId?: string } }
  | { type: 'CLOSE_TASK_MODAL' }
  | { type: 'OPEN_RECORD_MODAL'; payload: { recordId: string } }
  | { type: 'CLOSE_RECORD_MODAL' }
  | { type: 'SET_THEME'; payload: { theme: 'light' | 'dark' } };

// コンテキスト型
interface UIContextType extends UIState {
  openTaskModal: (mode: 'add' | 'edit', taskId?: string) => void;
  closeTaskModal: () => void;
  openRecordModal: (recordId: string) => void;
  closeRecordModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// テーマの取得（初期値）
function getInitialTheme(): 'light' | 'dark' {
  // ローカルストレージからの読み込み
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }
  
  // OSのプリファレンスをチェック
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // デフォルトはライトモード
  return 'light';
}

// 初期状態
const initialState: UIState = {
  taskModal: {
    open: false,
    mode: 'add',
  },
  recordModal: {
    open: false,
  },
  theme: getInitialTheme(), // 初期テーマを動的に決定
};

// コンテキスト作成
const UIContext = createContext<UIContextType | undefined>(undefined);

// リデューサー
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_TASK_MODAL':
      return {
        ...state,
        taskModal: {
          open: true,
          mode: action.payload.mode,
          taskId: action.payload.taskId,
        },
      };
    case 'CLOSE_TASK_MODAL':
      return {
        ...state,
        taskModal: {
          ...state.taskModal,
          open: false,
        },
      };
    case 'OPEN_RECORD_MODAL':
      return {
        ...state,
        recordModal: {
          open: true,
          recordId: action.payload.recordId,
        },
      };
    case 'CLOSE_RECORD_MODAL':
      return {
        ...state,
        recordModal: {
          ...state.recordModal,
          open: false,
        },
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload.theme,
      };
    default:
      return state;
  }
}

// プロバイダーコンポーネント
export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // テーマの変更をDOMに反映
  useEffect(() => {
    // DOMにテーマクラスを適用
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // テーマ設定をlocalStorageに保存
    localStorage.setItem('theme', state.theme);
    
    // color-schemeメタタグを更新
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', state.theme);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = state.theme;
      document.head.appendChild(meta);
    }
  }, [state.theme]);

  // コンテキスト値
  const value: UIContextType = {
    ...state,
    openTaskModal: (mode, taskId) =>
      dispatch({ type: 'OPEN_TASK_MODAL', payload: { mode, taskId } }),
    closeTaskModal: () => dispatch({ type: 'CLOSE_TASK_MODAL' }),
    openRecordModal: (recordId) =>
      dispatch({ type: 'OPEN_RECORD_MODAL', payload: { recordId } }),
    closeRecordModal: () => dispatch({ type: 'CLOSE_RECORD_MODAL' }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: { theme } }),
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// カスタムフック
export function useUIContext(): UIContextType {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
} 