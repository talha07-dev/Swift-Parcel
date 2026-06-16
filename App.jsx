import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import TrackParcel from './pages/TrackParcel';
import ParcelDetails from './pages/ParcelDetails';
import SupportChat from './pages/SupportChat';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/track/:id?" element={
              <PrivateRoute>
                <TrackParcel />
              </PrivateRoute>
            } />

            <Route path="/parcel/:id" element={
              <PrivateRoute>
                <ParcelDetails />
              </PrivateRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            } />

            <Route path="/driver-dashboard" element={
              <PrivateRoute>
                <DriverDashboard />
              </PrivateRoute>
            } />

            <Route path="/support" element={
              <PrivateRoute>
                <SupportChat />
              </PrivateRoute>
            } />
          </Routes>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
