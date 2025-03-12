import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import Hotels from './pages/Hotels';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import AdminHotels from './pages/AdminHotels';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Routes publiques */}
            <Route index element={<Home />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Routes protégées - Utilisateur connecté */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-booking"
              element={
                <ProtectedRoute>
                  <CreateBooking />
                </ProtectedRoute>
              }
            />

            {/* Routes protégées - Admin uniquement */}
            <Route
              path="admin-hotels"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminHotels />
                </ProtectedRoute>
              }
            />

            {/* Gestion des routes non trouvées */}
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
