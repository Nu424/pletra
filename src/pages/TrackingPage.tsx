import { useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useRecordContext } from '../contexts/RecordContext';
import { useUIContext } from '../contexts/UIContext';
import { useTimer } from '../hooks/useTimer';
import { formatTime } from '../utils/timeUtils';

export function TrackingPage() {
  const { tasks } = useTaskContext();
  const { activeRecord, startRecord, pauseRecord, resumeRecord, completeRecord, cancelRecord } = useRecordContext();
  const { openTaskModal } = useUIContext();
  
  const activeTask = activeRecord 
    ? tasks.find(task => task.id === activeRecord.taskId) 
    : undefined;
  
  // タイマーカスタムフック
  const timer = useTimer(activeRecord?.accumulated || 0);
  
  // タイマーの開始・停止を制御
  useEffect(() => {
    if (activeRecord) {
      // アクティブなレコードがある場合はタイマーを開始/再開
      if (!timer.isRunning) {
        timer.resume();
      }
    } else {
      // アクティブなレコードがない場合はタイマーを停止
      if (timer.isRunning) {
        timer.pause();
      }
    }
  }, [activeRecord, timer]);

  // タスク開始ハンドラー
  const handleStartTask = (taskId: string) => {
    if (activeRecord) {
      // 既に実行中のタスクがある場合は完了する
      completeRecord(timer.getElapsedTime());
      timer.reset();
    }
    
    startRecord(taskId);
  };

  // 一時停止ハンドラー
  const handlePauseRecord = () => {
    if (activeRecord) {
      pauseRecord(timer.getElapsedTime());
      timer.pause();
    }
  };

  // 再開ハンドラー
  const handleResumeRecord = () => {
    if (activeRecord) {
      resumeRecord();
      timer.resume();
    }
  };

  // 完了ハンドラー
  const handleCompleteRecord = () => {
    if (activeRecord) {
      completeRecord(timer.getElapsedTime());
      timer.reset();
    }
  };

  // 中断ハンドラー
  const handleCancelRecord = () => {
    if (activeRecord) {
      cancelRecord();
      timer.reset();
    }
  };

  return (
    <div className="space-y-6">
      {/* アクティブレコードカード */}
      {activeRecord && activeTask && (
        <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{activeTask.icon}</span>
              <span className="text-lg font-semibold">{activeTask.name}</span>
            </div>
            <div className="text-2xl font-mono">{formatTime(timer.elapsedTime)}</div>
          </div>
          
          <div className="mt-4 flex justify-between">
            {timer.isRunning ? (
              <button 
                onClick={handlePauseRecord}
                className="flex-1 py-2 px-4 mr-2 bg-white/20 hover:bg-white/30 rounded"
              >
                ⏸️ 一時停止
              </button>
            ) : (
              <button 
                onClick={handleResumeRecord}
                className="flex-1 py-2 px-4 mr-2 bg-white/20 hover:bg-white/30 rounded"
              >
                ▶️ 再開
              </button>
            )}
            <button 
              onClick={handleCompleteRecord}
              className="flex-1 py-2 px-4 mx-2 bg-green-500/50 hover:bg-green-500/70 rounded"
            >
              ✅ 完了
            </button>
            <button 
              onClick={handleCancelRecord}
              className="flex-1 py-2 px-4 ml-2 bg-red-500/50 hover:bg-red-500/70 rounded"
            >
              🗑️ 中断
            </button>
          </div>
        </div>
      )}
      
      {/* タスクグリッド */}
      <div>
        <h2 className="text-lg font-medium mb-3">タスク</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {tasks.map(task => (
            <button
              key={task.id}
              onClick={() => handleStartTask(task.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                openTaskModal('edit', task.id);
              }}
              className="aspect-square flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-2">{task.icon}</span>
              <span className="text-sm text-center">{task.name}</span>
            </button>
          ))}
          
          {/* 追加ボタン */}
          <button
            onClick={() => openTaskModal('add')}
            className="aspect-square flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 dark:border-gray-600"
          >
            <span className="text-3xl mb-2">➕</span>
            <span className="text-sm">追加</span>
          </button>
        </div>
      </div>
    </div>
  );
} 