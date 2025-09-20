import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { Admin } from './components/admin/Admin';
import { ProfilePage } from './components/pages/ProfilePage';
import { IssueDetailsPage } from './components/pages/IssueDetailsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { IssueProvider } from './contexts/IssueContext';
import { ErrorBoundary } from './components/ui/error-boundary';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // In a real app, you'd check user role/permissions
  // For now, we'll assume authenticated users can access admin (you can enhance this)
  
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();

  // Don't show navbar and footer on auth and admin pages
  const hideLayout = ['/login', '/register', '/admin'].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!hideLayout && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/issues" element={<IssuesFeedPage />} />
          <Route path="/issue/:id" element={<IssueDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route 
            path="/post-issue" 
            element={
              <ProtectedRoute>
                <PostIssuePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/confirmation" 
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
      
      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <IssueProvider>
            <AppContent />
          </IssueProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
