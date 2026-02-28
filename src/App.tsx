import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { Toaster } from './components/ui/toaster';

// Auth
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import Agents from './pages/admin/Agents';
import ConfigRules from './pages/admin/ConfigRules';
import AdminCoupons from './pages/admin/Coupons';
import AdminOrders from './pages/admin/Orders';

// Agent
import AgentDashboard from './pages/agent/Dashboard';
import AgentCoupons from './pages/agent/Coupons';
import AgentOrders from './pages/agent/Orders';

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role?: 'ADMIN' | 'AGENT' }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin) return <Navigate to="/change-password" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/agent'} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/admin" element={
            <PrivateRoute role="ADMIN">
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="agents" element={<Agents />} />
            <Route path="config" element={<ConfigRules />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          <Route path="/agent" element={
            <PrivateRoute role="AGENT">
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<AgentDashboard />} />
            <Route path="coupons" element={<AgentCoupons />} />
            <Route path="orders" element={<AgentOrders />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
