import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User, Home, Shield, Sparkles, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/parish');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
    isActive(path) 
      ? 'bg-brand-700 text-white shadow-md shadow-brand-700/20' 
      : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
  }`;

  return (
    <nav className="w-full glass-card border-b border-slate-100 sticky top-0 z-40 px-4 py-3 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo y Nombre */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-accent-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-brand-700 text-white p-2 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-bold text-slate-800 text-lg leading-tight block">Organizador de Monaguillos</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:block">Guía litúrgica inteligente</span>
          </div>
        </Link>

        {/* Enlaces de Navegación */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <Link to="/" className={linkClass('/')}>
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link to="/public-generator" className={linkClass('/public-generator')}>
            <Sparkles className="w-4 h-4" />
            <span>Público</span>
          </Link>
          {currentUser && (
            <>
              <Link to="/profile" className={linkClass('/profile')}>
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>
              <Link to="/parish" className={linkClass('/parish')}>
                <Shield className="w-4 h-4" />
                <span>Mi Parroquia</span>
              </Link>
            </>
          )}
        </div>

        {/* Sesión de Usuario / Login */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <img 
                src={currentUser.photoURL || 'https://via.placeholder.com/150'} 
                alt={currentUser.displayName} 
                className="w-8 h-8 rounded-full border-2 border-brand-500 shadow-sm"
              />
              <span className="text-sm font-semibold text-slate-700 hidden lg:inline max-w-[120px] truncate">
                {userProfile?.liturgicalName || currentUser.displayName}
              </span>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin} 
              className="flex items-center gap-2 bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-950 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-brand-700/20 hover:shadow-brand-700/35 transition-all transform active:scale-95 duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar con Google</span>
            </button>
          )}
        </div>
        
      </div>
    </nav>
  );
}
