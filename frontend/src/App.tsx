import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { PostIssuePage } from './components/pages/PostIssuePage';
import { ConfirmationPage } from './components/pages/ConfirmationPage';
import { IssuesFeedPage } from './components/pages/IssuesFeedPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { AboutPage } from './components/pages/AboutPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const handleSubmitIssue = (issue: {
    title: string;
    description: string;
    location: string;
    image?: File;
  }) => {
    // Handle issue submission logic here
    console.log('New issue submitted:', issue);
    // In a real app, you would send this to a backend API
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'post-issue':
        return (
          <PostIssuePage 
            onNavigate={handleNavigation} 
            onSubmitIssue={handleSubmitIssue}
          />
        );
      case 'confirmation':
        return <ConfirmationPage onNavigate={handleNavigation} />;
      case 'issues-feed':
        return <IssuesFeedPage onNavigate={handleNavigation} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigation} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigation} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigation} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigation} />;
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  // Don't show navbar and footer on auth pages
  const showLayout = !['login', 'register'].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      {showLayout && (
        <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      )}
      
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      
      {showLayout && (
        <Footer onNavigate={handleNavigation} />
      )}
    </div>
  );
}