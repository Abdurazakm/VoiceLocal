import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }[size];

  return (
    <Loader2 className={`animate-spin ${sizeClass} ${className}`} />
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = 'Loading...', className = '' }: LoadingOverlayProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  message?: string;
}

export function LoadingCard({ title = 'Loading', message = 'Please wait...' }: LoadingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3">
        <LoadingSpinner className="text-blue-600" />
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingPage({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-blue-600 mb-4 mx-auto" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
