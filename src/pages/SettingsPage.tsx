import { useTaskContext } from '../contexts/TaskContext';
import { useRecordContext } from '../contexts/RecordContext';
import { useUIContext } from '../contexts/UIContext';
import { useStorageService } from '../contexts/StorageContext';

export function SettingsPage() {
  const { theme, setTheme } = useUIContext();
  const { tasks } = useTaskContext();
  const { records } = useRecordContext();
  const storageService = useStorageService();
  
  // エクスポート処理
  const handleExport = () => {
    const data = {
      tasks,
      records,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // JSON データの作成
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // リンクを作成してクリックすることでダウンロード
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // クリーンアップ
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  // データをクリアする処理
  const handleClearData = () => {
    if (window.confirm('全てのデータを削除します。この操作は元に戻せません。よろしいですか？')) {
      storageService.saveTasks([]);
      storageService.saveRecords([]);
      window.location.reload();
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">設定</h1>
      
      {/* テーマ設定 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-3">テーマ</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 p-3 rounded ${
              theme === 'light' 
                ? 'bg-blue-100 border border-blue-500 dark:bg-blue-900' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <span className="block text-2xl mb-1">🌞</span>
            <span>ライト</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 p-3 rounded ${
              theme === 'dark' 
                ? 'bg-blue-100 border border-blue-500 dark:bg-blue-900' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <span className="block text-2xl mb-1">🌙</span>
            <span>ダーク</span>
          </button>
        </div>
      </div>
      
      {/* データ管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-3">データ管理</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              タスク: {tasks.length}個
              <br />
              記録: {records.length}個
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            データをエクスポート
          </button>
          <button
            onClick={handleClearData}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            データを全て削除
          </button>
        </div>
      </div>
      
      {/* アプリ情報 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-3">アプリについて</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Simple Time Tracker v1.0.0</p>
          <p className="mt-1">シンプルで使いやすいタイムトラッキングアプリ</p>
        </div>
      </div>
    </div>
  );
} 