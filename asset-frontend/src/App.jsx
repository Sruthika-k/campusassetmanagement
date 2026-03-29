import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Issues from './pages/Issues';
import BorrowRequests from './pages/Borrow';
import Maintenance from './pages/Issues';
import Users from './pages/admin/Users';
import Departments from './pages/admin/Departments';
import Rooms from './pages/admin/Rooms';
import Settings from './pages/admin/Settings';
import ScanPage from './pages/ScanPage';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scan/:assetId" element={<ScanPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="borrow" element={<BorrowRequests />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="users" element={<Users />} />
            <Route path="admin/departments" element={<Departments />} />
            <Route path="admin/rooms" element={<Rooms />} />
            <Route path="admin/settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
