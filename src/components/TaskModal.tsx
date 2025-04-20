import { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useUIContext } from '../contexts/UIContext';

// デフォルトの絵文字一覧
const DEFAULT_ICONS = [
  '📚', '💻', '🏃', '🧮', '🎯', '🎨', '🎮', '📝', 
  '☕', '🍽️', '🧹', '🛌', '📞', '🚗', '🏠', '🧠'
];

export function TaskModal() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskContext();
  const { taskModal, closeTaskModal } = useUIContext();
  
  // フォーム状態
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [error, setError] = useState('');
  
  // モーダル表示時にフォーカスを当てるための参照
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // モーダル状態変更時にフォームを初期化
  useEffect(() => {
    if (taskModal.open && taskModal.mode === 'edit' && taskModal.taskId) {
      const task = tasks.find(t => t.id === taskModal.taskId);
      if (task) {
        setName(task.name);
        setIcon(task.icon);
      }
    } else if (taskModal.open && taskModal.mode === 'add') {
      // 新規追加時は初期値をセット
      setName('');
      setIcon('📚');
    }
    
    setError('');
    
    // モーダルが開いたらフォーカスを当てる
    if (taskModal.open && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [taskModal, tasks]);
  
  // エスケープキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && taskModal.open) {
        closeTaskModal();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [taskModal.open, closeTaskModal]);
  
  // 保存ハンドラー
  const handleSave = () => {
    if (!name.trim()) {
      setError('タスク名を入力してください');
      return;
    }
    
    if (taskModal.mode === 'add') {
      addTask({ name: name.trim(), icon });
    } else if (taskModal.mode === 'edit' && taskModal.taskId) {
      const task = tasks.find(t => t.id === taskModal.taskId);
      if (task) {
        updateTask({ ...task, name: name.trim(), icon });
      }
    }
    
    closeTaskModal();
  };
  
  // 削除ハンドラー
  const handleDelete = () => {
    if (taskModal.taskId && window.confirm('このタスクを削除してもよろしいですか？')) {
      deleteTask(taskModal.taskId);
      closeTaskModal();
    }
  };
  
  if (!taskModal.open) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-labelledby="task-modal-title"
      aria-modal="true"
      onClick={(e) => {
        // 背景クリックでモーダルを閉じる
        if (e.target === e.currentTarget) {
          closeTaskModal();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h2 id="task-modal-title" className="text-lg font-semibold">
            {taskModal.mode === 'add' ? 'タスクを追加' : 'タスクを編集'}
          </h2>
        </div>
        
        <div className="p-4 space-y-4">
          {/* アイコン選択 */}
          <div>
            <label htmlFor="task-icon-grid" className="block text-sm font-medium mb-1">アイコン</label>
            <div id="task-icon-grid" className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="タスクアイコン">
              {DEFAULT_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`aspect-square flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all touch-target ${
                    icon === emoji ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500' : ''
                  }`}
                  aria-label={`絵文字: ${emoji}`}
                  aria-pressed={icon === emoji}
                  role="radio"
                  aria-checked={icon === emoji}
                >
                  <span className="emoji">{emoji}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* タスク名入力 */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium mb-1">
              タスク名
            </label>
            <input
              id="taskName"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="タスク名を入力"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              aria-invalid={error ? 'true' : 'false'}
            />
            {error && <p className="mt-1 text-sm text-red-500" role="alert">{error}</p>}
          </div>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 flex justify-between">
          <div>
            {taskModal.mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all touch-target"
                aria-label="タスクを削除"
              >
                削除
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-all touch-target"
              aria-label="キャンセル"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all touch-target"
              aria-label="タスクを保存"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 