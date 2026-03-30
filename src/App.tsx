import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginForm } from './components/auth/LoginForm';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { GroupsPage } from './components/groups/GroupsPage';
import { GroupDetails } from './components/groups/GroupDetails';
import { JoinGroup } from './components/groups/JoinGroup';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background font-sans text-slate-900 selection:bg-brand/10 selection:text-brand">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-12">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/join/:groupId" element={<JoinGroup />} />
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/groups" 
                element={
                  <AuthGuard>
                    <GroupsPage />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/groups/:groupId" 
                element={
                  <AuthGuard>
                    <GroupDetails />
                  </AuthGuard>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Toaster position="top-center" richColors />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
