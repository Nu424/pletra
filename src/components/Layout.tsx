import { Outlet, Link, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  // 現在のパスに応じたナビゲーションスタイル
  const getNavLinkClass = (path: string) => {
    const baseClass = 'flex-1 py-2 px-4 text-center transition';
    const activeClass = 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium';
    const inactiveClass = 'bg-gray-100 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800';
    
    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Simple Time Tracker
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>

      <nav className="bg-white dark:bg-gray-800 shadow-inner sticky bottom-0">
        <div className="container mx-auto flex">
          <Link to="/" className={getNavLinkClass('/')}>
            <div className="flex flex-col items-center">
              <span className="text-xl">⏱️</span>
              <span className="text-xs">記録</span>
            </div>
          </Link>
          <Link to="/history" className={getNavLinkClass('/history')}>
            <div className="flex flex-col items-center">
              <span className="text-xl">📋</span>
              <span className="text-xs">履歴</span>
            </div>
          </Link>
          <Link to="/settings" className={getNavLinkClass('/settings')}>
            <div className="flex flex-col items-center">
              <span className="text-xl">⚙️</span>
              <span className="text-xs">設定</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
} 