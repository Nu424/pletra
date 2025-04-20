import { useState, useMemo } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useRecordContext } from '../contexts/RecordContext';
import { useUIContext } from '../contexts/UIContext';
import { formatTime, formatDateTime, formatDuration } from '../utils/timeUtils';

// ソートオプション
type SortOption = 'newest' | 'oldest' | 'longest' | 'shortest';

export function HistoryPage() {
  const { tasks } = useTaskContext();
  const { records } = useRecordContext();
  const { openRecordModal } = useUIContext();
  
  // 検索とソートの状態
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  // 完了したレコードのみをフィルタリング
  const completedRecords = useMemo(() => 
    records.filter(record => record.endAt !== undefined),
  [records]);
  
  // 検索とソートを適用したレコードリスト
  const filteredAndSortedRecords = useMemo(() => {
    // 検索フィルタリング
    let filtered = completedRecords;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = completedRecords.filter(record => {
        const task = tasks.find(t => t.id === record.taskId);
        return task && task.name.toLowerCase().includes(query);
      });
    }
    
    // ソート
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return (b.endAt || 0) - (a.endAt || 0);
        case 'oldest':
          return (a.endAt || 0) - (b.endAt || 0);
        case 'longest':
          return b.accumulated - a.accumulated;
        case 'shortest':
          return a.accumulated - b.accumulated;
        default:
          return 0;
      }
    });
  }, [completedRecords, tasks, searchQuery, sortOption]);
  
  // 合計時間の計算
  const totalTime = useMemo(() => 
    filteredAndSortedRecords.reduce((sum, record) => sum + record.accumulated, 0),
  [filteredAndSortedRecords]);
  
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">履歴</h1>
      
      {/* 検索・ソート */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="タスク名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="longest">長い順</option>
            <option value="shortest">短い順</option>
          </select>
        </div>
      </div>
      
      {/* 合計時間 */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">合計時間</p>
        <p className="text-xl font-semibold">{formatDuration(totalTime)}</p>
      </div>
      
      {/* レコードリスト */}
      <div className="space-y-3">
        {filteredAndSortedRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            記録がありません
          </div>
        ) : (
          filteredAndSortedRecords.map(record => {
            const task = tasks.find(t => t.id === record.taskId);
            return (
              <div 
                key={record.id}
                onClick={() => openRecordModal(record.id)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{task?.icon || '🔍'}</span>
                    <span className="font-medium">{task?.name || '不明なタスク'}</span>
                  </div>
                  <span className="font-mono text-lg">{formatTime(record.accumulated)}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-1">
                  <div>開始: {formatDateTime(record.startAt)}</div>
                  <div>終了: {formatDateTime(record.endAt || 0)}</div>
                  {record.note && (
                    <div className="col-span-2 mt-1 italic">{record.note}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 