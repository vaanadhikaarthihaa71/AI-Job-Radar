import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radar } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-paper-dark flex flex-col items-center justify-center p-6 text-ink dark:text-ink-dark font-mono">
        <div className="w-12 h-12 rounded-full bg-signal/10 border border-signal flex items-center justify-center animate-spin mb-4">
          <Radar className="w-6 h-6 text-signal" />
        </div>
        <div className="text-xs tracking-widest text-ink-muted dark:text-ink-dark-muted uppercase animate-pulse">
          VERIFYING AUTHENTICATED SESSION...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
