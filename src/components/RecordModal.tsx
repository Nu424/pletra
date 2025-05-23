import { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useRecordContext } from '../contexts/RecordContext';
import { useUIContext } from '../contexts/UIContext';
import { formatTime, formatDateTime } from '../utils/timeUtils';

export function RecordModal() {
  const { tasks } = useTaskContext();
  const { records, updateRecord, deleteRecord } = useRecordContext();
  const { recordModal, closeRecordModal } = useUIContext();
  
  // フォーム状態
  const [note, setNote] = useState('');
  
  // テキストエリアへの参照
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 現在表示中のレコード
  const currentRecord = recordModal.recordId
    ? records.find(r => r.id === recordModal.recordId)
    : undefined;
  
  // タスク情報
  const task = currentRecord
    ? tasks.find(t => t.id === currentRecord.taskId)
    : undefined;
  
  // モーダル表示時にフォームを初期化
  useEffect(() => {
    if (recordModal.open && currentRecord) {
      setNote(currentRecord.note || '');
      
      // テキストエリアにフォーカス
      setTimeout(() => {
        noteTextareaRef.current?.focus();
      }, 100);
    }
  }, [recordModal, currentRecord]);
  
  // エスケープキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && recordModal.open) {
        closeRecordModal();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [recordModal.open, closeRecordModal]);
  
  // 保存ハンドラー
  const handleSave = () => {
    if (currentRecord) {
      updateRecord({
        ...currentRecord,
        note: note.trim() || undefined
      });
      closeRecordModal();
    }
  };
  
  // 削除ハンドラー
  const handleDelete = () => {
    if (recordModal.recordId && window.confirm('この記録を削除してもよろしいですか？')) {
      deleteRecord(recordModal.recordId);
      closeRecordModal();
    }
  };
  
  if (!recordModal.open || !currentRecord || !task) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-labelledby="record-modal-title"
      aria-modal="true"
      onClick={(e) => {
        // 背景クリックでモーダルを閉じる
        if (e.target === e.currentTarget) {
          closeRecordModal();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h2 id="record-modal-title" className="text-lg font-semibold">記録の詳細</h2>
        </div>
        
        <div className="p-4 space-y-4">
          {/* タスク情報 */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="emoji">{task.icon}</span>
            <span className="text-lg font-medium">{task.name}</span>
            <span className="ml-auto font-mono font-semibold">
              {formatTime(currentRecord.accumulated)}
            </span>
          </div>
          
          {/* 時間情報 */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">開始時刻</div>
              <div>{formatDateTime(currentRecord.startAt)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">終了時刻</div>
              <div>{currentRecord.endAt ? formatDateTime(currentRecord.endAt) : '-'}</div>
            </div>
          </div>
          
          {/* メモ入力 */}
          <div className="pt-2">
            <label htmlFor="recordNote" className="block text-sm font-medium mb-1">
              メモ
            </label>
            <textarea
              id="recordNote"
              ref={noteTextareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="メモを入力"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              aria-label="記録のメモ"
            />
          </div>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all touch-target"
            aria-label="記録を削除"
          >
            削除
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={closeRecordModal}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-all touch-target"
              aria-label="キャンセル"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all touch-target"
              aria-label="記録を保存"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 