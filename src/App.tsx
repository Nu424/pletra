import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StorageServiceProvider } from './contexts/StorageContext';
import { UIProvider } from './contexts/UIContext';
import { TaskProvider } from './contexts/TaskContext';
import { RecordProvider } from './contexts/RecordContext';
import { Layout } from './components/Layout';
import { TrackingPage } from './pages/TrackingPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskModal } from './components/TaskModal';
import { RecordModal } from './components/RecordModal';
import { TimerProvider } from './contexts/TimerContext';

function App() {
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <StorageServiceProvider>
        <TimerProvider>
          <UIProvider>
            <TaskProvider>
              <RecordProvider>
                {/* メインコンテンツ */}
                <Routes>
                  <Route path="/" element={<Layout />} >
                    <Route index element={<TrackingPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Routes>

                {/* モーダルコンポーネント */}
                <TaskModal />
                <RecordModal />
              </RecordProvider>
            </TaskProvider>
          </UIProvider>
        </TimerProvider>
      </StorageServiceProvider>
    </BrowserRouter>
  );
}

export default App;
