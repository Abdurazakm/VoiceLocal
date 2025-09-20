import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Issues } from './pages/Issues';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';

interface AdminProps {
  onLogout?: () => void;
}

export function Admin({ onLogout }: AdminProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'issues':
        return <Issues />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={handleNavigation}
      onLogout={onLogout}
    >
      {renderCurrentPage()}
    </AdminLayout>
  );
}
