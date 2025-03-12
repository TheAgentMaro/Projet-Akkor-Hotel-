import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages publiques
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Hotels from './pages/Hotels';

// Pages protégées
import Profile from './pages/auth/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminHotels from './pages/AdminHotels';
import EmployeeUsers from './pages/EmployeeUsers';
import Bookings from './pages/Bookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels" element={<Hotels />} />
            
            {/* Routes protégées - Utilisateur */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* Routes protégées - Admin */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotels"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminHotels />
                </ProtectedRoute>
              }
            />

            {/* Routes protégées - Employee */}
            <Route
              path="/employee/users"
              element={
                <ProtectedRoute requireEmployee>
                  <EmployeeUsers />
                </ProtectedRoute>
              }
            />

            {/* Route 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Page non trouvée</h2>
                    <p className="text-gray-600">La page que vous recherchez n'existe pas.</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
