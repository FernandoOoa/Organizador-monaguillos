import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ParishService } from '../services/ParishService';
import { allObjects } from '../config/liturgicalObjects';
import { Save, User, Award, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [liturgicalName, setLiturgicalName] = useState('');
  const [size, setSize] = useState('chico');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cargar datos actuales del perfil del usuario
  useEffect(() => {
    if (userProfile) {
      setLiturgicalName(userProfile.liturgicalName || currentUser?.displayName || '');
      setSize(userProfile.size || 'chico');
      setSkills(userProfile.skills || []);
    }
  }, [userProfile, currentUser]);

  const handleSkillToggle = (objId) => {
    if (skills.includes(objId)) {
      setSkills(skills.filter(id => id !== objId));
    } else {
      setSkills([...skills, objId]);
    }
  };

  const handleSelectAllSkills = () => {
    if (skills.length === allObjects.length) {
      setSkills([]); // Deseleccionar todos
    } else {
      setSkills(allObjects.map(obj => obj.id)); // Seleccionar todos
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await ParishService.updateUserProfile(currentUser.uid, {
        liturgicalName,
        size,
        skills
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-500 font-semibold">Por favor, inicia sesión con Google para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border-t-8 border-t-brand-700 p-6 sm:p-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Mi Perfil Litúrgico</h2>
        <p className="text-slate-500 font-medium">Configura tus datos y las habilidades que posees en el altar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Información del Usuario */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <img 
            src={currentUser.photoURL || 'https://via.placeholder.com/150'} 
            alt={currentUser.displayName} 
            className="w-16 h-16 rounded-full border-4 border-white shadow-md shadow-slate-200"
          />
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{currentUser.displayName}</h3>
            <p className="text-sm text-slate-400">{currentUser.email}</p>
          </div>
        </div>

        {/* Nombre Litúrgico */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nombre Litúrgico / Apodo</label>
          <input 
            type="text"
            required
            value={liturgicalName}
            onChange={(e) => setLiturgicalName(e.target.value)}
            placeholder="Ej. Juanito o Juan P."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
          />
        </div>

        {/* Tamaño / Nivel */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-sans">Tamaño / Experiencia</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'chico', label: 'Niño Chico', desc: 'Ayudante inicial en el altar' },
              { id: 'grande', label: 'Niño Grande', desc: 'Experto en tareas estándar' },
              { id: 'grande_incienso', label: 'Niño Grande (Sabe Incensar)', desc: 'Prioridad para el Incensario' }
            ].map(item => (
              <label 
                key={item.id} 
                className={`p-4 rounded-2xl border text-center cursor-pointer transition-all duration-300 block hover:bg-slate-50 ${
                  size === item.id 
                    ? 'border-2 border-brand-700 bg-brand-50/10 shadow-sm' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <input 
                  type="radio" 
                  name="size" 
                  value={item.id} 
                  checked={size === item.id}
                  onChange={() => setSize(item.id)}
                  className="sr-only"
                />
                <span className="font-bold text-slate-800 text-sm block">{item.label}</span>
                <span className="text-[10px] text-slate-400 block mt-1 leading-normal">{item.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Habilidades / Servicios que sabe hacer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Habilidades y Servicios Litúrgicos</label>
            <button 
              type="button"
              onClick={handleSelectAllSkills}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
            >
              {skills.length === allObjects.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </button>
          </div>
          
          <div className="space-y-6 max-h-[350px] overflow-y-auto p-3 border border-slate-100 rounded-2xl bg-slate-50/50">
            {/* Uso Normal */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200/60 pb-1">Uso Normal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allObjects.filter(o => o.category === 'normal').map(obj => {
                  const isChecked = skills.includes(obj.id);
                  return (
                    <label 
                      key={obj.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border shadow-xs cursor-pointer hover:bg-white transition-all ${
                        isChecked ? 'border-brand-500 bg-white shadow-xs' : 'border-slate-200 bg-white/40'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSkillToggle(obj.id)}
                        className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700"
                      />
                      <div className="p-1 bg-slate-100 rounded-lg">{obj.icon}</div>
                      <span className="font-semibold text-slate-700 text-xs">{obj.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Uso Solemne */}
            <div>
              <h4 className="text-xs font-bold text-accent-500 uppercase tracking-wider mb-3 border-b border-slate-200/60 pb-1">Uso Solemne</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allObjects.filter(o => o.category === 'solemne').map(obj => {
                  const isChecked = skills.includes(obj.id);
                  return (
                    <label 
                      key={obj.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border shadow-xs cursor-pointer hover:bg-white transition-all ${
                        isChecked ? 'border-brand-500 bg-white shadow-xs' : 'border-slate-200 bg-white/40'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSkillToggle(obj.id)}
                        className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700"
                      />
                      <div className="p-1 bg-slate-100 rounded-lg">{obj.icon}</div>
                      <span className="font-semibold text-slate-700 text-xs">{obj.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 justify-end">
          {success && (
            <div className="text-emerald-600 font-bold text-sm flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Perfil guardado correctamente!</span>
            </div>
          )}
          <button 
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-400 text-white font-bold px-6 py-3 rounded-2xl text-base shadow-lg shadow-brand-700/25 transition-all active:scale-95 duration-200 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

      </form>

    </div>
  );
}
