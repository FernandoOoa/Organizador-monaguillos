import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import OfflineBanner from './components/ui/OfflineBanner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PublicGenerator from './pages/PublicGenerator';
import Profile from './pages/Profile';
import ParishDashboard from './pages/ParishDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <OfflineBanner />
            <Navbar />
            <main className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route path="/public-generator" element={<PublicGenerator />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/parish" element={<ParishDashboard />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
