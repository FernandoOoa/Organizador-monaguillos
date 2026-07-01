import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ParishService } from '../services/ParishService';
import { allObjects, getTaskEmoji } from '../config/liturgicalObjects';
import { assignParishTasks } from '../utils/parishAssignmentAlgorithm';
import { db } from '../config/firebase';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { 
  Shield, UserPlus, Users, Sparkles, Copy, MessageSquare, Trash2,
  X, Plus, RefreshCw, LogOut, Check, CheckCircle2, AlertTriangle, UserMinus
} from 'lucide-react';

export default function ParishDashboard() {
  const { currentUser, userProfile } = useAuth();
  
  // Estados de carga e ingreso/creación
  const [parish, setParish] = useState(null);
  const [members, setMembers] = useState([]);
  const [virtuals, setVirtuals] = useState([]);
  const [parishNameInput, setParishNameInput] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados de generación de roles (Admin)
  const [presentKids, setPresentKids] = useState([]); // [{ id, name, size, skills }]
  const [objectsConfig, setObjectsConfig] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  // Estados de monaguillos virtuales
  const [virtualName, setVirtualName] = useState('');
  const [virtualSize, setVirtualSize] = useState('chico');
  const [virtualSkills, setVirtualSkills] = useState([]);
  const [showAddVirtualModal, setShowAddVirtualModal] = useState(false);

  const parishId = userProfile?.parishId;
  const isAdmin = parish && parish.adminId === currentUser?.uid;

  // Cargar/Suscribirse a datos de la Parroquia, Miembros y Virtuales
  useEffect(() => {
    if (!parishId) {
      setLoading(false);
      setParish(null);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // 1. Suscribirse a la parroquia en tiempo real
    const parishRef = doc(db, 'parishes', parishId);
    const unsubParish = onSnapshot(parishRef, (docSnap) => {
      if (docSnap.exists()) {
        setParish(docSnap.data());
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    // 2. Suscribirse a los miembros (usuarios reales)
    const membersQuery = query(collection(db, 'users'), where('parishId', '==', parishId));
    const unsubMembers = onSnapshot(membersQuery, (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      setMembers(list);
    });

    // 3. Suscribirse a monaguillos virtuales
    const virtualsRef = collection(db, 'parishes', parishId, 'virtuals');
    const unsubVirtuals = onSnapshot(virtualsRef, (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setVirtuals(list);
    });

    return () => {
      unsubParish();
      unsubMembers();
      unsubVirtuals();
    };
  }, [parishId]);

  // Inicializar configuraciones de objetos si no existen
  useEffect(() => {
    const initialConfig = {};
    allObjects.forEach(obj => {
      initialConfig[obj.id] = {
        checked: obj.checked,
        qty: obj.defaultQty || 1
      };
    });
    setObjectsConfig(initialConfig);
  }, []);

  // Pre-seleccionar todos los monaguillos disponibles por defecto cuando se cargan por primera vez
  useEffect(() => {
    if (presentKids.length === 0 && (members.length > 0 || virtuals.length > 0)) {
      const initialKids = [];
      members.forEach(m => {
        initialKids.push({
          id: m.uid,
          name: m.liturgicalName || m.displayName,
          size: m.size || 'chico',
          skills: m.skills || []
        });
      });
      virtuals.forEach(v => {
        initialKids.push({
          id: v.id,
          name: v.name,
          size: v.size || 'chico',
          skills: v.skills || []
        });
      });
      setPresentKids(initialKids);
    }
  }, [members, virtuals]);

  // Crear Parroquia
  const handleCreateParish = async (e) => {
    e.preventDefault();
    if (!parishNameInput.trim()) return;
    setActionLoading(true);
    try {
      await ParishService.createParish(currentUser.uid, parishNameInput.trim());
      setParishNameInput('');
    } catch (err) {
      alert("Error al crear parroquia: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Unirse a Parroquia
  const handleJoinParish = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setActionLoading(true);
    try {
      await ParishService.joinParish(currentUser.uid, inviteCodeInput.trim());
      setInviteCodeInput('');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Salir de Parroquia
  const handleLeaveParish = async () => {
    if (window.confirm("¿Seguro que deseas salir de esta parroquia?")) {
      setActionLoading(true);
      try {
        await ParishService.leaveParish(currentUser.uid);
        setParish(null);
      } catch (err) {
        alert(err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Regenerar Código de Invitación (Admin)
  const handleRegenerateInviteCode = async () => {
    if (!isAdmin) return;
    setActionLoading(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await updateDoc(doc(db, 'parishes', parishId), { inviteCode: newCode });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Expulsar Miembro (Admin)
  const handleKickMember = async (memberId) => {
    if (window.confirm("¿Estás seguro de que deseas expulsar a este monaguillo?")) {
      try {
        await ParishService.kickMember(memberId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Crear Monaguillo Virtual (Admin)
  const handleAddVirtual = async (e) => {
    e.preventDefault();
    if (!virtualName.trim()) return;
    try {
      await ParishService.addVirtualMonaguillo(
        parishId, 
        virtualName.trim(), 
        virtualSize, 
        virtualSkills
      );
      setVirtualName('');
      setVirtualSkills([]);
      setShowAddVirtualModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar Monaguillo Virtual (Admin)
  const handleDeleteVirtual = async (id) => {
    if (window.confirm("¿Eliminar este monaguillo virtual?")) {
      try {
        await ParishService.deleteVirtualMonaguillo(parishId, id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Toggle Monaguillo Presente (agrega al final si no está, o lo quita)
  const toggleMonaguilloPresence = (kidData) => {
    const isPresent = presentKids.some(k => k.id === kidData.id);
    if (isPresent) {
      setPresentKids(prev => prev.filter(k => k.id !== kidData.id));
    } else {
      setPresentKids(prev => [...prev, kidData]);
    }
  };

  // Reordenar monaguillos presentes (para establecer orden de llegada manual)
  const moveKid = (index, direction) => {
    const newKids = [...presentKids];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newKids.length) return;
    const temp = newKids[index];
    newKids[index] = newKids[targetIndex];
    newKids[targetIndex] = temp;
    setPresentKids(newKids);
  };

  // Configuración de Objetos
  const handleObjectCheck = (id) => {
    const current = objectsConfig[id] || { checked: false, qty: 1 };
    setObjectsConfig({
      ...objectsConfig,
      [id]: { ...current, checked: !current.checked }
    });
  };

  const handleObjectQtyChange = (id, val) => {
    const current = objectsConfig[id] || { checked: false, qty: 1 };
    setObjectsConfig({
      ...objectsConfig,
      [id]: { ...current, qty: Math.max(1, parseInt(val) || 1) }
    });
  };

  // Generar Asignaciones
  const handleGenerateAssignments = async () => {
    setErrorMsg('');
    setWarningMsg('');

    // Crear lista de monaguillos presentes en el orden de llegada de la lista
    const presentMonaguillos = presentKids.map(k => ({
      id: k.id,
      originalName: k.name,
      name: k.name,
      size: k.size,
      preassignedTasks: [],
      skills: k.skills || []
    }));

    if (presentMonaguillos.length === 0) {
      setErrorMsg("Debes seleccionar al menos un monaguillo presente para realizar la asignación.");
      return;
    }

    const selectedIds = Object.keys(objectsConfig).filter(key => objectsConfig[key].checked);
    const qtys = {};
    Object.keys(objectsConfig).forEach(key => {
      qtys[key] = objectsConfig[key].qty || 1;
    });

    // Ejecutar algoritmo
    const result = assignParishTasks(presentMonaguillos, selectedIds, qtys);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    // Convertir el resultado a un formato plano almacenable en Firestore
    const assignmentsList = result.assignedKids.map(kid => ({
      monaguilloId: kid.id,
      name: kid.originalName,
      size: kid.size,
      tasks: kid.tasks
    }));

    try {
      // Guardar asignaciones en la base de datos
      await ParishService.saveParishAssignments(
        parishId, 
        assignmentsList, 
        userProfile?.liturgicalName || currentUser?.displayName || 'Desconocido',
        result.warnings
      );
      setWarningMsg('');
    } catch (err) {
      alert("Error al guardar asignaciones: " + err.message);
    }
  };

  // Compartir texto
  const handleShare = (action) => {
    if (!parish?.latestAssignments) return;
    
    let text = `⛪ *Organización de Monaguillos: ${parish.name}* ⛪\n_Asignación de tareas para la Santa Misa_\n\n`;
    
    parish.latestAssignments.forEach((k, i) => {
      let sizeLabel = k.size === 'grande_incienso' ? 'Grande/Incienso' : (k.size === 'grande' ? 'Grande' : 'Chico');
      text += `👤 *${i + 1}. ${k.name}* (${sizeLabel}):\n`;
      if (k.tasks && k.tasks.length > 0) {
        k.tasks.forEach(t => {
          const isObj = typeof t === 'object';
          const tName = isObj ? t.name : t;
          const warningSymbol = (isObj && t.warningNoSkill) ? ' (⚠️ No capacitado)' : '';
          const emoji = getTaskEmoji(tName);
          text += `  ${emoji} ${tName}${warningSymbol}\n`;
        });
      } else {
        text += `  💤 Sin tareas asignadas\n`;
      }
      text += `\n`;
    });
    
    text += `_Generado el ${new Date(parish.latestAssignmentsDate).toLocaleString()}_`;
    
    if (action === 'copy') {
      navigator.clipboard.writeText(text).then(() => {
        alert('¡Texto copiado al portapapeles!');
      }).catch(err => {
        console.error(err);
      });
    } else if (action === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 text-brand-700 animate-spin" />
        <span className="ml-2 font-semibold text-slate-500">Cargando parroquia...</span>
      </div>
    );
  }

  // PANTALLA 1: El usuario no pertenece a ninguna parroquia
  if (!parishId) {
    return (
      <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-8 animate-[fadeIn_0.3s_ease-out] border-t-8 border-t-brand-700">
        <div className="text-center">
          <Shield className="w-12 h-12 text-brand-700 mx-auto" />
          <h2 className="text-3xl font-extrabold text-slate-900 mt-4">Unirse o Crear Parroquia</h2>
          <p className="text-slate-500 font-medium mt-1">Conecta con tu grupo de monaguillos en la nube</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-4">
          {/* Unirse a parroquia */}
          <form onSubmit={handleJoinParish} className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-700" /> Unirse a Parroquia
              </h3>
              <p className="text-slate-400 text-xs">Pídele el código de acceso al administrador de tu parroquia.</p>
              <input 
                type="text"
                required
                maxLength={6}
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="Código de 6 dígitos"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white uppercase"
              />
            </div>
            <button 
              type="submit"
              disabled={actionLoading}
              className="w-full bg-slate-800 text-white hover:bg-slate-900 py-3 rounded-xl font-bold text-sm transition-all"
            >
              {actionLoading ? 'Ingresando...' : 'Unirse'}
            </button>
          </form>

          {/* Crear Parroquia */}
          <form onSubmit={handleCreateParish} className="space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l md:pl-8 pt-6 md:pt-0 border-slate-100">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-700" /> Crear Parroquia
              </h3>
              <p className="text-slate-400 text-xs">Conviértete en administrador para poder generar roles y administrar.</p>
              <input 
                type="text"
                required
                value={parishNameInput}
                onChange={(e) => setParishNameInput(e.target.value)}
                placeholder="Nombre de la Parroquia"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
              />
            </div>
            <button 
              type="submit"
              disabled={actionLoading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-brand-700/10 transition-all"
            >
              {actionLoading ? 'Creando...' : 'Crear Nueva'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PANTALLA 2: Dashboard del Miembro / Administrador
  return (
    <div className="max-w-6xl w-full mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Encabezado de la Parroquia */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-brand-700 text-white p-3.5 rounded-2xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{parish?.name}</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Administrador: {isAdmin ? 'Tú eres el Administrador' : 'Otro usuario'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-bold">CÓDIGO DE UNIÓN:</span>
              <span className="font-extrabold text-brand-700 tracking-wider text-base">{parish?.inviteCode}</span>
              <button 
                onClick={handleRegenerateInviteCode}
                title="Generar nuevo código"
                className="text-slate-400 hover:text-slate-600 transition-colors ml-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
          <button 
            onClick={handleLeaveParish}
            className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LISTADO DE MONAGUILLOS (Miembros Reales + Virtuales) */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-700" /> Miembros ({members.length + virtuals.length})
            </h3>
            {isAdmin && (
              <button 
                onClick={() => setShowAddVirtualModal(true)}
                className="bg-brand-50 hover:bg-brand-100 text-brand-700 p-1.5 rounded-lg transition-all"
                title="Añadir monaguillo virtual"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {/* Miembros reales */}
            {members.map(member => {
              const isPresent = presentKids.some(k => k.id === member.uid);
              return (
                <div key={member.uid} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isPresent ? 'border-brand-200 bg-brand-50/10' : 'border-slate-100 bg-slate-50/50'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <input 
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => toggleMonaguilloPresence({
                        id: member.uid,
                        name: member.liturgicalName || member.displayName,
                        size: member.size || 'chico',
                        skills: member.skills || []
                      })}
                      className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700 flex-shrink-0"
                      title="Presente hoy"
                    />
                    <img src={member.photoURL} alt={member.displayName} className="w-6 h-6 rounded-full border" />
                    <span className="text-xs font-bold text-slate-700 truncate">{member.liturgicalName || member.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{member.size === 'grande_incienso' ? 'Grande/Inc' : member.size}</span>
                    {isAdmin && member.uid !== currentUser.uid && (
                      <button 
                        onClick={() => handleKickMember(member.uid)}
                        className="text-slate-300 hover:text-red-600 transition-colors"
                        title="Expulsar"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Miembros virtuales */}
            {virtuals.map(v => {
              const isPresent = presentKids.some(k => k.id === v.id);
              return (
                <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl border border-dashed transition-all ${
                  isPresent ? 'border-amber-300 bg-amber-50/20' : 'border-amber-200 bg-amber-50/10'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <input 
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => toggleMonaguilloPresence({
                        id: v.id,
                        name: v.name,
                        size: v.size || 'chico',
                        skills: v.skills || []
                      })}
                      className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700 flex-shrink-0"
                      title="Presente hoy"
                    />
                    <span className="text-xs font-bold text-amber-950 truncate">👤 {v.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-amber-500 uppercase">{v.size === 'grande_incienso' ? 'Grande/Inc' : v.size} (V)</span>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteVirtual(v.id)}
                        className="text-amber-300 hover:text-red-600 transition-colors"
                        title="Eliminar virtual"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ASIGNACIONES / GENERACIÓN DE ROLES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Configuración de la Liturgia y Asignación (Disponible para todos los miembros) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-brand-700" /> Configuración de la Liturgia y Asignación
            </h3>

            {/* Objetos a utilizar */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Uso Normal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allObjects.filter(o => o.category === 'normal').map(obj => {
                    const config = objectsConfig[obj.id] || { checked: obj.checked, qty: obj.defaultQty || 1 };
                    const isSelected = config.checked;

                    return (
                      <label key={obj.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-xs cursor-pointer hover:bg-slate-50 transition-all ${
                        isSelected ? 'border-l-4 border-l-brand-600 bg-brand-50/10' : 'border-slate-200 bg-white'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleObjectCheck(obj.id)}
                          className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700"
                        />
                        <div className="p-1 bg-slate-100 rounded-lg">{obj.icon}</div>
                        <span className="font-semibold text-slate-700 text-xs flex-1">{obj.name}</span>
                        {obj.rules === 'multiple' && (
                          <input 
                            type="number"
                            min="1"
                            max="8"
                            value={config.qty}
                            onChange={(e) => handleObjectQtyChange(obj.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-10 px-1 py-0.5 text-xs border border-slate-200 rounded-md text-center bg-white"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-accent-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">Uso Solemne</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allObjects.filter(o => o.category === 'solemne').map(obj => {
                    const config = objectsConfig[obj.id] || { checked: obj.checked, qty: obj.defaultQty || 1 };
                    const isSelected = config.checked;

                    return (
                      <label key={obj.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-xs cursor-pointer hover:bg-slate-50 transition-all ${
                        isSelected ? 'border-l-4 border-l-brand-600 bg-brand-50/10' : 'border-slate-200 bg-white'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleObjectCheck(obj.id)}
                          className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700"
                        />
                        <div className="p-1 bg-slate-100 rounded-lg">{obj.icon}</div>
                        <span className="font-semibold text-slate-700 text-xs flex-1">{obj.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alertas */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 text-xs">
                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Lista ordenada de Presentes (Orden de Llegada) */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Asistencia (Orden de Llegada: {presentKids.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Añade en la barra lateral</span>
              </h4>
              
              {presentKids.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">Selecciona monaguillos en la lista lateral para agregarlos en orden de llegada...</p>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {presentKids.map((k, index) => (
                    <div key={k.id} className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold shadow-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 text-[10px] font-bold w-4 text-center">{index + 1}.</span>
                        <span className="text-slate-700 truncate">{k.name}</span>
                        <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-extrabold uppercase">
                          {k.size === 'grande_incienso' ? 'Grande/Inc.' : k.size}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => moveKid(index, -1)}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Subir orden"
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => moveKid(index, 1)}
                          disabled={index === presentKids.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Bajar orden"
                        >
                          ▼
                        </button>
                        <button 
                          onClick={() => toggleMonaguilloPresence(k)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Quitar de la lista"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón de Sorteo */}
            <button 
              onClick={handleGenerateAssignments}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold text-base py-3.5 rounded-2xl shadow-md shadow-brand-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Generar y Guardar Asignación en la Nube
            </button>
          </div>

          {/* VISTA DE ROLES ACTUALES EN LA PARROQUIA (Sincronizado en tiempo real) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Roles Litúrgicos Vigentes
                </h3>
                {parish?.latestAssignmentsDate && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Generado {parish.latestAssignmentsAuthor ? `por ${parish.latestAssignmentsAuthor}` : ''} el {new Date(parish.latestAssignmentsDate).toLocaleString()}
                  </p>
                )}
              </div>
              {parish?.latestAssignments && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShare('copy')}
                    className="inline-flex items-center gap-1.5 bg-slate-800 text-white hover:bg-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </button>
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              )}
            </div>

            {!parish?.latestAssignments || parish.latestAssignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 italic text-sm">Aún no se han generado asignaciones para la parroquia.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {parish.latestAssignments.map((k, index) => {
                  let badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                  if (k.size === 'grande_incienso') badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  else if (k.size === 'grande') badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                  // Resaltar tarjeta si pertenece al usuario conectado
                  const isCurrentUserCard = k.monaguilloId === currentUser.uid;

                  return (
                    <div key={index} className={`border rounded-2xl overflow-hidden shadow-xs relative transition-all ${
                      isCurrentUserCard ? 'ring-2 ring-brand-700 bg-brand-50/5' : 'border-slate-100 bg-white'
                    }`}>
                      <div className={`absolute top-0 left-0 w-full h-1 ${
                        isCurrentUserCard ? 'bg-brand-700' : 'bg-slate-200'
                      }`}></div>
                      <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {index + 1}. {k.name} {isCurrentUserCard && '⭐'}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {k.size === 'grande_incienso' ? 'Grande/Inc.' : k.size === 'grande' ? 'Grande' : 'Chico'}
                        </span>
                      </div>
                      <div className="p-3">
                        {k.tasks.length === 0 ? (
                          <div className="text-[10px] text-slate-400 italic">Sin tareas asignadas</div>
                        ) : (
                          <ul className="space-y-1">
                            {k.tasks.map((task, tIdx) => {
                              const isObj = typeof task === 'object';
                              const taskName = isObj ? task.name : task;
                              const isWarning = isObj ? task.warningNoSkill : false;

                              return (
                                <li key={tIdx} className={`text-xs font-semibold flex items-center justify-between p-1 rounded-lg ${
                                  isWarning ? 'bg-amber-50 text-amber-900 border border-amber-200 px-2' : 'text-slate-700'
                                }`}>
                                  <span className="flex items-center gap-1.5">
                                    <span>{getTaskEmoji(taskName)}</span>
                                    <span>{taskName}</span>
                                  </span>
                                  {isWarning && (
                                    <span className="text-[8px] font-extrabold text-amber-700 bg-amber-100 px-1 rounded" title="Habilidad no registrada en su perfil">
                                      ⚠️ Ver
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Listado de Advertencias de Asignación Forzada */}
            {parish?.latestAssignmentsWarnings && parish.latestAssignmentsWarnings.length > 0 && (
              <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-[fadeIn_0.3s_ease-out]">
                <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> Monaguillos asignados sin habilidad registrada (Supervisar)
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950 font-semibold">
                  {parish.latestAssignmentsWarnings.map((w, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-amber-100 shadow-xs">
                      <span className="text-[9px] font-extrabold bg-amber-200 text-amber-800 px-2 py-1 rounded-md flex-shrink-0">
                        ⚠️ {w.taskName}
                      </span>
                      <span>Asignado a: <strong className="font-bold text-slate-800">{w.kidName}</strong></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL: Crear Monaguillo Virtual */}
      {showAddVirtualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddVirtual} className="bg-white rounded-3xl border-t-8 border-t-brand-700 max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[fadeIn_0.2s_ease-out]">
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="text-lg font-bold text-slate-900">Agregar Monaguillo Virtual</h4>
              <button type="button" onClick={() => setShowAddVirtualModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={virtualName}
                  onChange={(e) => setVirtualName(e.target.value)}
                  placeholder="Ej. Mateo Gómez"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nivel / Experiencia</label>
                <select 
                  value={virtualSize}
                  onChange={(e) => setVirtualSize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="chico">Niño Chico</option>
                  <option value="grande">Niño Grande</option>
                  <option value="grande_incienso">Niño Grande (Sabe Incensar)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Habilidades (Opcional)</label>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50">
                  {allObjects.map(obj => {
                    const isChecked = virtualSkills.includes(obj.id);
                    return (
                      <label key={obj.id} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setVirtualSkills(virtualSkills.filter(id => id !== obj.id));
                            } else {
                              setVirtualSkills([...virtualSkills, obj.id]);
                            }
                          }}
                          className="w-4 h-4 rounded text-brand-700 border-slate-300"
                        />
                        <span className="font-semibold text-slate-600 truncate">{obj.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                type="button"
                onClick={() => setShowAddVirtualModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-100 text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm"
              >
                Añadir
              </button>
            </footer>
          </form>
        </div>
      )}

    </div>
  );
}
