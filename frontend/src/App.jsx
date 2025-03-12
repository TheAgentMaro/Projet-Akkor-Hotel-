import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import Hotels from './pages/Hotels';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import AdminHotels from './pages/AdminHotels';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="create-booking" element={<CreateBooking />} />
          <Route path="admin-hotels" element={<AdminHotels />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
