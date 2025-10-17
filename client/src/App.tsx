import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/hooks/useAuth';
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth';
import { HybridAuthProvider, useHybridAuth } from '@/hooks/useHybridAuth';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import LoginForm from '@/components/Auth/LoginForm';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Classes from '@/pages/Classes';
import Attendance from '@/pages/Attendance';
import Reports from '@/pages/Reports';
import Cadres from '@/pages/Cadres';
import Classrooms from '@/pages/Classrooms';
import EditMainBranch from '@/pages/EditMainBranch';
import NotFound from "./pages/NotFound";
import Settings from '@/pages/Settings';
import UserManagement from '@/pages/UserManagement';
import SetPassword from '@/pages/SetPassword';
import AuthCallback from '@/pages/AuthCallback';
import CompleteProfile from '@/pages/CompleteProfile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors (401, 403) or if error is an auth error
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry on "refresh_token_not_found" errors
        if (error?.code === 'refresh_token_not_found' || error?.message?.includes('refresh_token')) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      // Increase stale time to reduce unnecessary refetches
      staleTime: 1000 * 60, // 1 minute
      // Prevent refetch on window focus for tab switching
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useHybridAuth();
  
  console.log('🟡 [ProtectedRoute] Render:', {
    hasUser: !!user,
    userEmail: user?.email,
    isLoading,
    showingLoginForm: !isLoading && !user,
    showingContent: !isLoading && !!user
  });
  
  if (isLoading) {
    console.log('🟡 [ProtectedRoute] Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('🟡 [ProtectedRoute] No user, showing login form');
    return <LoginForm />;
  }
  
  console.log('🟡 [ProtectedRoute] User authenticated, loading DatabaseProvider');
  return (
    <DatabaseProvider>
      <MainLayout>{children}</MainLayout>
    </DatabaseProvider>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <Classes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-classes"
        element={
          <ProtectedRoute>
            <Classes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cadres"
        element={
          <ProtectedRoute>
            <Cadres />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms"
        element={
          <ProtectedRoute>
            <Classrooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/main-branches/:id/edit"
        element={
          <ProtectedRoute>
            <EditMainBranch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute>
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold mb-4">我的考勤</h2>
              <p className="text-gray-600">功能开发中...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SupabaseAuthProvider>
          <HybridAuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </HybridAuthProvider>
        </SupabaseAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
