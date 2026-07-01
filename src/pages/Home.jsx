import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield, User, LogIn, ChevronRight, BookOpen, Compass, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { currentUser, loading, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/parish');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <span className="text-slate-500 font-semibold">Cargando aplicación...</span>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/parish" replace />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 space-y-12 max-w-5xl mx-auto w-full">
      
      {/* Header Sección Principal */}
      <header className="text-center space-y-6 max-w-3xl animate-[fadeIn_0.5s_ease-out]">
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-accent-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white rounded-3xl p-6 shadow-xl ring-4 ring-white flex justify-center items-center">
              {/* Cruz / Icono Principal */}
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-brand-700" fill="currentColor">
                <path d="M45,10 L55,10 L55,30 L75,30 L75,40 L55,40 L55,90 L45,90 L45,40 L25,40 L25,30 L45,30 Z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
          Organizador de Monaguillos
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          Gestiona los servicios y asignaciones litúrgicas de forma inteligente y equitativa.
        </p>

        {!currentUser && (
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={handleLogin}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-950 text-white font-bold px-6 py-3 rounded-full text-base shadow-lg shadow-brand-700/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <LogIn className="w-5 h-5" />
              Empezar con Google
            </button>
            <Link 
              to="/public-generator"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full text-base hover:bg-slate-50 shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              Uso Público Rápido
              <ChevronRight className="w-4 h-4 text-brand-700" />
            </Link>
          </div>
        )}
      </header>

      {/* Características / Opciones del Sistema */}
      <section className="grid md:grid-cols-2 gap-8 w-full">
        
        {/* Generador Público */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col justify-between group hover:border-brand-100 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-300 group-hover:bg-brand-600 transition-colors"></div>
          <div>
            <div className="bg-slate-50 text-slate-600 p-3.5 rounded-2xl w-fit group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-3">Generador Público</h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              Funciona igual que la versión original. Registra monaguillos de forma manual o usando la plantilla rápida al momento. La asignación se genera al instante usando almacenamiento local.
            </p>
            <ul className="space-y-2 mt-6">
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Sin registrarse ni iniciar sesión</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Plantilla rápida en orden de llegada</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Edición de pre-asignaciones manuales</span>
              </li>
            </ul>
          </div>
          <div className="pt-8">
            <Link 
              to="/public-generator"
              className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 text-white hover:bg-slate-900 py-3.5 rounded-2xl font-bold transition-all"
            >
              Abrir Generador Público
            </Link>
          </div>
        </div>

        {/* Parroquia con Firebase */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col justify-between group hover:border-brand-200 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-700"></div>
          <div>
            <div className="bg-brand-50 text-brand-700 p-3.5 rounded-2xl w-fit">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-3">Red de Parroquias</h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              Conecta a los monaguillos reales de tu parroquia en la nube. Cada monaguillo ingresa con Google, guarda sus habilidades y disponibilidad, y el administrador genera los roles basándose en perfiles reales.
            </p>
            <ul className="space-y-2 mt-6">
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Perfiles en la nube con Google Auth</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Soporte para monaguillos virtuales</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Asignaciones en tiempo real guardadas</span>
              </li>
            </ul>
          </div>
          <div className="pt-8">
            {currentUser ? (
              <Link 
                to="/parish"
                className="inline-flex items-center justify-center gap-2 w-full bg-brand-700 hover:bg-brand-800 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-700/20 transition-all"
              >
                Ir a Mi Parroquia
              </Link>
            ) : (
              <button 
                onClick={handleLogin}
                className="inline-flex items-center justify-center gap-2 w-full bg-brand-700 hover:bg-brand-800 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-700/20 transition-all"
              >
                Iniciar sesión y Unirse
              </button>
            )}
          </div>
        </div>

      </section>

      {/* Footer / Nota */}
      <footer className="w-full text-center text-slate-400 text-sm pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>Organizador de Monaguillos &copy; 2026</p>
        <div className="flex gap-4">
          <a href="https://fonts.google.com" target="_blank" className="hover:text-slate-600">Google Fonts</a>
          <a href="https://tailwindcss.com" target="_blank" className="hover:text-slate-600">Tailwind CSS</a>
          <a href="https://firebase.google.com" target="_blank" className="hover:text-slate-600">Firebase</a>
        </div>
      </footer>

    </div>
  );
}
