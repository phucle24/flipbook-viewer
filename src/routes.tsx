import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import HomePage from './components/HomePage';

// Lazy load components for better performance
import { lazy, Suspense } from 'react';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AddStoryPage = lazy(() => import('./pages/AddStoryPage'));
const EditStoryPage = lazy(() => import('./pages/EditStoryPage'));
const ViewStoryPage = lazy(() => import('./pages/ViewStoryPage'));

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 border-t-4 border-violet-600 border-solid rounded-full animate-spin" />
      <p className="text-violet-600 text-lg font-medium">Loading...</p>
    </div>
  </div>
);

// Protected route for authenticated users
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Admin route for admin users only
const AdminRoute = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<Loading />}>
            <UserDashboard />
          </Suspense>
        ),
      },
      {
        path: 'story/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <ViewStoryPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: 'add-story',
        element: (
          <Suspense fallback={<Loading />}>
            <AddStoryPage />
          </Suspense>
        ),
      },
      {
        path: 'edit-story/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <EditStoryPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
