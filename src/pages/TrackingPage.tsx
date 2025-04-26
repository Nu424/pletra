import { useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useRecordContext } from '../contexts/RecordContext';
import { useUIContext } from '../contexts/UIContext';
import { TaskButton } from '../components/TaskButton';
import { formatTime } from '../utils/timeUtils';
import { useTimerContext } from '../contexts/TimerContext';

export function TrackingPage() {
  const { tasks } = useTaskContext();
  const { activeRecord, selectTask, startRecord, pauseRecord, resumeRecord, completeRecord, cancelRecord, deselectTask } = useRecordContext();
  const { openTaskModal } = useUIContext();
  
  const activeTask = activeRecord 
    ? tasks.find(task => task.id === activeRecord.taskId) 
    : undefined;
  
  // タイマーカスタムフック
  const timer = useTimerContext();

  // タスク選択ハンドラー
  const handleSelectTask = (taskId: string) => {
    // 既にアクティブなタスクがある場合、まずそれを完了させる
    if (activeRecord && activeRecord.startAt > 0) {
      completeRecord(timer.getCurrentTime());
      timer.reset();
    } else if (activeRecord) {
      // タスクが選択されているだけで記録が開始されていない場合は、タスクを解除
      deselectTask();
    }
    
    // 新しいタスクを選択
    selectTask(taskId);
  };

  // 記録開始ハンドラー
  const handleStartRecord = () => {
    if (activeRecord && activeRecord.startAt === 0) {
      startRecord();
      timer.start(activeRecord?.accumulated || 0); // タイマーも開始
    }
  };

  // 一時停止ハンドラー
  const handlePauseRecord = () => {
    if (activeRecord && activeRecord.startAt > 0) {
      pauseRecord(timer.getCurrentTime());
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
    if (activeRecord && activeRecord.startAt > 0) {
      completeRecord(timer.getCurrentTime());
      timer.reset();
    } else if (activeRecord) {
      // タスクが選択されているだけで記録が開始されていない場合は、タスクを解除するだけ
      deselectTask();
    }
  };

  // 中断ハンドラー
  const handleCancelRecord = () => {
    if (activeRecord) {
      cancelRecord();
      timer.reset();
    }
  };

  // タスク解除ハンドラー
  const handleDeselectTask = () => {
    if (activeRecord) {
      deselectTask();
    }
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
              <div className="text-2xl font-mono">{formatTime(timer.currentTime)}</div>
            </div>
            
            <div className="mt-4 flex justify-between">
              {activeRecord.startAt > 0 ? (
                // 記録中の場合は一時停止/再開ボタンを表示
                timer.isRunning ? (
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
                )
              ) : (
                // 記録開始前は開始ボタンを表示
                <button 
                  onClick={handleStartRecord}
                  className="flex-1 py-2 px-4 mr-2 bg-green-500/50 hover:bg-green-500/70 rounded touch-target transition-all active:bg-green-500/80"
                  aria-label="開始"
                >
                  <span className="emoji">▶️</span> 開始
                </button>
              )}
              
              {activeRecord.startAt > 0 ? (
                // 記録中の場合は完了ボタンを表示
                <button 
                  onClick={handleCompleteRecord}
                  className="flex-1 py-2 px-4 mx-2 bg-green-500/50 hover:bg-green-500/70 rounded touch-target transition-all active:bg-green-500/80"
                  aria-label="完了"
                >
                  <span className="emoji">✅</span> 完了
                </button>
              ) : (
                // 記録開始前は解除ボタンを表示
                <button 
                  onClick={handleDeselectTask}
                  className="flex-1 py-2 px-4 mx-2 bg-yellow-500/50 hover:bg-yellow-500/70 rounded touch-target transition-all active:bg-yellow-500/80"
                  aria-label="解除"
                >
                  <span className="emoji">🔄</span> 解除
                </button>
              )}
              
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
              下のタスクをタップして選択しましょう！
            </p>
          </div>
        )}
      </div>
      
      {/* タスクグリッド */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-medium mb-3">タスク</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {tasks.map((task, index) => (
            <TaskButton
              key={task.id}
              task={task}
              index={index}
              onClick={handleSelectTask}
              onLongPress={(taskId) => openTaskModal('edit', taskId)}
            />
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