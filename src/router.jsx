import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import PrivateRoute from './components/auth/privateRoute';
import LoadingSpinner from './components/common/loadingSpinner';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/loginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/dashboardPage'));
const InventoryPage = lazy(() => import('./pages/inventoryPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

const withSuspense = (Component) => (
  <Suspense fallback={
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="large" />
    </div>
  }>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <PrivateRoute>{withSuspense(DashboardPage)}</PrivateRoute>,
      },
      {
        path: 'inventory',
        element: <PrivateRoute>{withSuspense(InventoryPage)}</PrivateRoute>,
      },
      {
        path: 'inventory/add',
        element: <PrivateRoute requireAdmin>{withSuspense(InventoryPage)}</PrivateRoute>,
      },
      {
        path: 'inventory/:id',
        element: <PrivateRoute>{withSuspense(InventoryPage)}</PrivateRoute>,
      },
      {
        path: 'orders',
        element: <PrivateRoute>{withSuspense(OrdersPage)}</PrivateRoute>,
      },
      {
        path: 'orders/:id',
        element: <PrivateRoute>{withSuspense(OrdersPage)}</PrivateRoute>,
      },
      {
        path: 'users',
        element: <PrivateRoute requireAdmin>{withSuspense(UsersPage)}</PrivateRoute>,
      },
      {
        path: 'profile',
        element: <PrivateRoute>{withSuspense(ProfilePage)}</PrivateRoute>,
      },
      {
        path: 'settings',
        element: <PrivateRoute>{withSuspense(SettingsPage)}</PrivateRoute>,
      },
      {
        path: 'reports',
        element: <PrivateRoute requireAdmin>{withSuspense(ReportsPage)}</PrivateRoute>,
      },
    ],
  },
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/signup',
    element: withSuspense(SignupPage),
  },
]);