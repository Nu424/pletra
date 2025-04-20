import { createContext, ReactNode, useContext } from 'react';
import { IStorageService, defaultStorageService } from '../services/storage';

// StorageServiceコンテキスト作成
const StorageServiceContext = createContext<IStorageService | undefined>(undefined);

// プロバイダーコンポーネント
export function StorageServiceProvider({
  children,
  service = defaultStorageService,
}: {
  children: ReactNode;
  service?: IStorageService;
}) {
  return (
    <StorageServiceContext.Provider value={service}>
      {children}
    </StorageServiceContext.Provider>
  );
}

// カスタムフック
export function useStorageService(): IStorageService {
  const context = useContext(StorageServiceContext);
  if (!context) {
    throw new Error('useStorageService must be used within a StorageServiceProvider');
  }
  return context;
} 