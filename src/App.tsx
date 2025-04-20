import { StorageServiceProvider } from './contexts/StorageContext';
import { UIProvider } from './contexts/UIContext';
import { TaskProvider } from './contexts/TaskContext';
import { RecordProvider } from './contexts/RecordContext';

function App() {
  return (
    <StorageServiceProvider>
      <UIProvider>
        <TaskProvider>
          <RecordProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <header className="p-4 bg-white dark:bg-gray-800 shadow">
                <h1 className="text-2xl font-bold text-center">Simple Time Tracker</h1>
              </header>
              <main className="container mx-auto p-4">
                <div className="text-center">
                  <p>タイムトラッカーアプリ（実装中）</p>
                </div>
              </main>
            </div>
          </RecordProvider>
        </TaskProvider>
      </UIProvider>
    </StorageServiceProvider>
  );
}

export default App;
