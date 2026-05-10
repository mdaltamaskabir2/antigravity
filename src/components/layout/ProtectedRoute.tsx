import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { currentUser, loading, isAdmin, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
        <p className="mt-4 text-on-surface-variant font-medium">Verifying Session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log("Access Denied: User is not admin", { email: currentUser?.email, role: userProfile?.role });
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
        <span className="material-symbols-outlined text-error text-[64px] mb-4">lock</span>
        <h1 className="text-3xl font-bold text-error mb-2">Access Denied</h1>
        <p className="text-on-surface-variant text-center max-w-[400px]">You do not have administrative privileges to view this page.</p>
        <p className="text-caption text-outline mt-6">Signed in as: {currentUser.email}</p>
      </div>
    );
  }

  return <>{children}</>;
}
