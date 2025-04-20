import { useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useRecordContext } from '../contexts/RecordContext';
import { useUIContext } from '../contexts/UIContext';
import { useTimer } from '../hooks/useTimer';
import { useLongPress } from '../hooks/useLongPress';
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

  // 各タスクの長押し処理用のフック生成関数
  const createTaskLongPressHandlers = (task: { id: string }) => {
    return useLongPress({
      onClick: () => handleStartTask(task.id),
      onLongPress: () => openTaskModal('edit', task.id),
      threshold: 600, // 長押しと判定する時間（ms）
    });
  };

  return (
    <div className="space-y-6">
      {/* アクティブレコードカード - 常に表示 */}
      <div className="transition-all animate-fade-in">
        {activeRecord && activeTask ? (
          <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="emoji">{activeTask.icon}</span>
                <span className="text-lg font-semibold">{activeTask.name}</span>
              </div>
              <div className="text-2xl font-mono">{formatTime(timer.elapsedTime)}</div>
            </div>
            
            <div className="mt-4 flex justify-between">
              {timer.isRunning ? (
                <button 
                  onClick={handlePauseRecord}
                  className="flex-1 py-2 px-4 mr-2 bg-white/20 hover:bg-white/30 rounded touch-target transition-all active:bg-white/40"
                  aria-label="一時停止"
                >
                  <span className="emoji">⏸️</span> 一時停止
                </button>
              ) : (
                <button 
                  onClick={handleResumeRecord}
                  className="flex-1 py-2 px-4 mr-2 bg-white/20 hover:bg-white/30 rounded touch-target transition-all active:bg-white/40"
                  aria-label="再開"
                >
                  <span className="emoji">▶️</span> 再開
                </button>
              )}
              <button 
                onClick={handleCompleteRecord}
                className="flex-1 py-2 px-4 mx-2 bg-green-500/50 hover:bg-green-500/70 rounded touch-target transition-all active:bg-green-500/80"
                aria-label="完了"
              >
                <span className="emoji">✅</span> 完了
              </button>
              <button 
                onClick={handleCancelRecord}
                className="flex-1 py-2 px-4 ml-2 bg-red-500/50 hover:bg-red-500/70 rounded touch-target transition-all active:bg-red-500/80"
                aria-label="中断"
              >
                <span className="emoji">🗑️</span> 中断
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
            <div className="emoji text-4xl mb-2">👇</div>
            <p className="text-gray-600 dark:text-gray-300">
              下のタスクをタップして記録を始めましょう！
            </p>
          </div>
        )}
      </div>
      
      {/* タスクグリッド */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-medium mb-3">タスク</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {tasks.map((task, index) => (
            <button
              key={task.id}
              {...createTaskLongPressHandlers(task)}
              className="aspect-square flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all touch-target active:bg-gray-100 dark:active:bg-gray-700"
              style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              aria-label={`タスク: ${task.name}`}
            >
              <span className="emoji mb-2">{task.icon}</span>
              <span className="text-sm text-center">{task.name}</span>
            </button>
          ))}
          
          {/* 追加ボタン */}
          <button
            onClick={() => openTaskModal('add')}
            className="aspect-square flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all border-2 border-dashed border-gray-300 dark:border-gray-600 touch-target active:bg-gray-100 dark:active:bg-gray-700"
            style={{ animationDelay: `${0.05 * (tasks.length + 1)}s` }}
            aria-label="新しいタスクを追加"
          >
            <span className="emoji mb-2">➕</span>
            <span className="text-sm">追加</span>
          </button>
        </div>
      </div>
      
      {/* ヘルプ情報 */}
      <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <p><span className="emoji">💡</span> <strong>ヒント:</strong> タスクを長押しするとアイコンと名前を編集できます</p>
      </div>
    </div>
  );
} 