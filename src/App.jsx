import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PublicGenerator from './pages/PublicGenerator';
import Profile from './pages/Profile';
import ParishDashboard from './pages/ParishDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/public-generator" element={<PublicGenerator />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/parish" element={<ParishDashboard />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
