import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './components/HomePage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ViewStoryPage from './pages/ViewStoryPage';
import AddStoryPage from './pages/AddStoryPage';
import EditStoryPage from './pages/EditStoryPage';
import AdminPdfImportPage from './pages/AdminPdfImportPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/user',
        element: <UserDashboard />,
      },
      {
        path: '/admin',
        element: <AdminDashboard />,
      },
      {
        path: '/dashboard',
        element: <UserDashboard />,
      },
      {
        path: '/view/:storyId',
        element: <ViewStoryPage />,
      },
      {
        path: '/admin/add-story',
        element: <AddStoryPage />,
      },
      {
        path: '/admin/edit-story/:storyId',
        element: <EditStoryPage />,
      },
      {
        path: '/admin/pdf-import',
        element: <AdminPdfImportPage />,
      },
      {
        path: '/admin/import-pdf',
        element: <AdminPdfImportPage />,
      },
      {
        path: '/story/:storyId',
        element: <ViewStoryPage />,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
