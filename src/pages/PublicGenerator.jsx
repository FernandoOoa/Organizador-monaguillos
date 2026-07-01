import React, { useState, useEffect } from 'react';
import { allObjects, getTaskEmoji } from '../config/liturgicalObjects';
import { assignLiturgicalTasks } from '../utils/assignmentAlgorithm';
import { 
  Users, Plus, Trash2, Sparkles, Copy, MessageSquare, 
  Pencil, X, ArrowRight, CheckCircle2, UserCog, AlertTriangle
} from 'lucide-react';

export default function PublicGenerator() {
  const [kids, setKids] = useState([]);
  const [kidName, setKidName] = useState('');
  const [kidSize, setKidSize] = useState('chico');
  const [objectsConfig, setObjectsConfig] = useState({});
  const [results, setResults] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estado para el modal de edición
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSize, setEditSize] = useState('chico');
  const [editPreassigned, setEditPreassigned] = useState([]);

  // Cargar configuraciones de LocalStorage al iniciar
  useEffect(() => {
    // Monaguillos
    const savedKids = localStorage.getItem('monaguillosList');
    if (savedKids) {
      setKids(JSON.parse(savedKids));
    }

    // Configuración de Objetos
    const savedObjects = localStorage.getItem('liturgicalObjects');
    if (savedObjects) {
      setObjectsConfig(JSON.parse(savedObjects));
    } else {
      // Configuración predeterminada
      const initialConfig = {};
      allObjects.forEach(obj => {
        initialConfig[obj.id] = {
          checked: obj.checked,
          qty: obj.defaultQty || 1
        };
      });
      setObjectsConfig(initialConfig);
    }
  }, []);

  // Guardar monaguillos en LocalStorage
  const saveKids = (updatedKids) => {
    setKids(updatedKids);
    localStorage.setItem('monaguillosList', JSON.stringify(updatedKids));
  };

  // Guardar configuración de objetos en LocalStorage
  const saveObjectsConfig = (newConfig) => {
    setObjectsConfig(newConfig);
    localStorage.setItem('liturgicalObjects', JSON.stringify(newConfig));
  };

  // Agregar monaguillo manualmente
  const handleAddKid = (e) => {
    e.preventDefault();
    const name = kidName.trim() || 'Monaguillo';
    const newKid = {
      originalName: name,
      name: `${kids.length + 1}. ${name}`,
      size: kidSize,
      preassignedTasks: [],
      tasks: []
    };
    const updated = [...kids, newKid];
    saveKids(updated);
    setKidName('');
  };

  // Plantilla Rápida (Agregar anónimo)
  const addAnonymousKid = (size) => {
    const newKid = {
      originalName: 'Monaguillo',
      name: `${kids.length + 1}. Monaguillo`,
      size: size,
      preassignedTasks: [],
      tasks: []
    };
    const updated = [...kids, newKid];
    saveKids(updated);
  };

  // Eliminar monaguillo
  const removeKid = (index) => {
    const updated = kids.filter((_, i) => i !== index);
    // Recalcular los números de índice en los nombres
    const recalculated = updated.map((k, i) => ({
      ...k,
      name: `${i + 1}. ${k.originalName}`
    }));
    saveKids(recalculated);
    setResults(null);
  };

  // Manejar cambio en checkboxes de objetos
  const handleObjectCheck = (id) => {
    const current = objectsConfig[id] || { checked: false, qty: 1 };
    const updated = {
      ...objectsConfig,
      [id]: {
        ...current,
        checked: !current.checked
      }
    };
    saveObjectsConfig(updated);
  };

  // Manejar cambio en cantidades de objetos múltiples
  const handleObjectQtyChange = (id, val) => {
    const current = objectsConfig[id] || { checked: false, qty: 1 };
    const updated = {
      ...objectsConfig,
      [id]: {
        ...current,
        qty: Math.max(1, parseInt(val) || 1)
      }
    };
    saveObjectsConfig(updated);
  };

  // Limpiar todo
  const clearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar todos los monaguillos y resultados?')) {
      saveKids([]);
      setResults(null);
      setWarningMsg('');
      setErrorMsg('');
    }
  };

  // Abrir Modal de Edición
  const openEditModal = (index) => {
    const kid = kids[index];
    setEditIndex(index);
    setEditName(kid.originalName);
    setEditSize(kid.size);
    setEditPreassigned(kid.preassignedTasks || []);
  };

  // Guardar Cambios en Monaguillo
  const handleSaveKidChanges = () => {
    const updated = [...kids];
    const originalName = editName.trim() || 'Monaguillo';
    updated[editIndex] = {
      ...updated[editIndex],
      originalName: originalName,
      name: `${editIndex + 1}. ${originalName}`,
      size: editSize,
      preassignedTasks: editPreassigned
    };
    saveKids(updated);
    setEditIndex(null);
    setResults(null);
  };

  // Manejar toggle de pre-asignación
  const handlePreassignToggle = (objId) => {
    if (editPreassigned.includes(objId)) {
      setEditPreassigned(editPreassigned.filter(id => id !== objId));
    } else {
      setEditPreassigned([...editPreassigned, objId]);
    }
  };

  // Ejecutar el Algoritmo de Asignación
  const handleAssign = () => {
    setErrorMsg('');
    setWarningMsg('');

    const selectedIds = Object.keys(objectsConfig).filter(key => objectsConfig[key].checked);
    const qtys = {};
    Object.keys(objectsConfig).forEach(key => {
      qtys[key] = objectsConfig[key].qty || 1;
    });

    const result = assignLiturgicalTasks(kids, selectedIds, qtys);

    if (result.error) {
      setErrorMsg(result.error);
      setResults(null);
      return;
    }

    setResults(result.assignedKids);
    if (result.warningChicos) {
      setWarningMsg('Atención: Faltan niños Grandes. Se asignaron tareas pesadas (Ciriales, Incienso, Libro) a niños chicos. Supervíselos.');
    }
  };

  // Mover Tarea manualmente (Mobile dropdown)
  const moveTaskMobile = (taskName, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const updated = [...results];
    
    // Quitar de origen
    updated[fromIndex].tasks = updated[fromIndex].tasks.filter(t => t !== taskName);
    // Añadir a destino
    updated[toIndex].tasks = [...updated[toIndex].tasks, taskName];
    
    setResults(updated);
  };

  // Compartir en WhatsApp o Copiar Texto
  const handleShare = (action) => {
    if (!results || results.length === 0) return;
    
    let text = `⛪ *Organización de Monaguillos* ⛪\n_Asignación de tareas para la Santa Misa_\n\n`;
    
    results.forEach(k => {
      let sizeLabel = k.size === 'grande_incienso' ? 'Grande/Incienso' : (k.size === 'grande' ? 'Grande' : 'Chico');
      text += `👤 *${k.name}* (${sizeLabel}):\n`;
      if (k.tasks && k.tasks.length > 0) {
        k.tasks.forEach(t => {
          const emoji = getTaskEmoji(t);
          text += `  ${emoji} ${t}\n`;
        });
      } else {
        text += `  💤 Sin tareas asignadas\n`;
      }
      text += `\n`;
    });
    
    text += `_Generado automáticamente por la Plataforma._`;
    
    if (action === 'copy') {
      navigator.clipboard.writeText(text).then(() => {
        alert('¡Texto copiado al portapapeles!');
      }).catch(err => {
        console.error('Error al copiar:', err);
      });
    } else if (action === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border-t-8 border-t-brand-700 p-6 sm:p-8 space-y-12">
      
      {/* Título de la página */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Generador Público</h2>
        <p className="text-slate-500 font-medium">Asignador rápido sin inicio de sesión (almacenamiento local)</p>
      </div>

      {/* Sección 1: Monaguillos */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-brand-100 p-2 rounded-xl text-brand-700">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">1. Registrar Monaguillos</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Registro Manual */}
          <form onSubmit={handleAddKid} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingreso Manual</h4>
            <input 
              type="text" 
              placeholder="Nombre (opcional)" 
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={kidSize}
                onChange={(e) => setKidSize(e.target.value)}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="chico">Niño Chico</option>
                <option value="grande">Niño Grande</option>
                <option value="grande_incienso">Niño Grande (Sabe Incensar)</option>
              </select>
              <button 
                type="submit"
                className="bg-slate-800 text-white hover:bg-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                Agregar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Plantilla Rápida */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Plantilla Rápida</h4>
              <p className="text-amber-700 text-xs mb-4">Agrega monaguillos en orden de llegada sin escribir nombres:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => addAnonymousKid('chico')}
                className="flex-1 bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 px-3 py-2 rounded-xl font-semibold text-sm transition-all"
              >
                + Chico
              </button>
              <button 
                onClick={() => addAnonymousKid('grande')}
                className="flex-1 bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 px-3 py-2 rounded-xl font-semibold text-sm transition-all"
              >
                + Grande
              </button>
              <button 
                onClick={() => addAnonymousKid('grande_incienso')}
                className="w-full bg-white border border-amber-200 text-amber-950 hover:bg-amber-100 px-3 py-2 rounded-xl font-bold text-xs transition-all mt-2"
              >
                + Grande (Sabe Incensar)
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Monaguillos */}
        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          {kids.length === 0 ? (
            <p className="text-slate-400 text-sm italic w-full text-center my-auto">No hay monaguillos registrados aún.</p>
          ) : (
            kids.map((k, i) => {
              let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
              if (k.size === 'grande_incienso') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
              else if (k.size === 'grande') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div key={i} className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-white ${badgeClass}`}>
                  <span className="font-bold truncate max-w-[120px]">{k.name}</span>
                  {k.preassignedTasks?.length > 0 && (
                    <span className="bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]" title={`Fijados: ${k.preassignedTasks.join(', ')}`}>
                      📌 {k.preassignedTasks.length}
                    </span>
                  )}
                  <button onClick={() => openEditModal(i)} className="hover:text-brand-800 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeKid(i)} className="hover:text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Sección 2: Objetos */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-brand-100 p-2 rounded-xl text-brand-700">
            <UserCog className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">2. Objetos Litúrgicos a Utilizar</h3>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Uso Normal</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allObjects.filter(o => o.category === 'normal').map(obj => {
                const config = objectsConfig[obj.id] || { checked: obj.checked, qty: obj.defaultQty || 1 };
                const isSelected = config.checked;

                return (
                  <label key={obj.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm cursor-pointer hover:bg-slate-50 transition-all ${
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
                        className="w-12 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center bg-white focus:outline-none"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-accent-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Uso Solemne</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allObjects.filter(o => o.category === 'solemne').map(obj => {
                const config = objectsConfig[obj.id] || { checked: obj.checked, qty: obj.defaultQty || 1 };
                const isSelected = config.checked;

                return (
                  <label key={obj.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm cursor-pointer hover:bg-slate-50 transition-all ${
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
      </section>

      {/* Sección 3: Acciones */}
      <section className="space-y-4 pt-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 text-sm">
            <X className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {warningMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{warningMsg}</span>
          </div>
        )}

        <button 
          onClick={handleAssign}
          className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-brand-700/35 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          Generar Asignación Automática
        </button>

        <button 
          onClick={clearAll}
          className="w-full bg-transparent hover:bg-slate-50 text-slate-500 border border-dashed border-slate-300 font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar Monaguillos y Resultados
        </button>
      </section>

      {/* Resultados de la Asignación */}
      {results && (
        <section className="space-y-6 pt-6 border-t border-slate-100 animate-[fadeIn_0.4s_ease-out]">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              Asignación Final
            </h3>
            <p className="text-slate-500 text-sm">Distribución equitativa generada. Puedes reasignar tareas si es necesario.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button 
                onClick={() => handleShare('copy')}
                className="inline-flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-all"
              >
                <Copy className="w-4 h-4" /> Copiar Texto
              </button>
              <button 
                onClick={() => handleShare('whatsapp')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-4 py-2 rounded-xl text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Enviar por WhatsApp
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {results.map((k, index) => {
              let badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
              if (k.size === 'grande_incienso') badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
              else if (k.size === 'grande') badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';

              return (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-700 to-brand-500"></div>
                  
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="font-bold text-slate-800 truncate pr-2 text-sm">{k.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${badgeClass}`}>
                      {k.size === 'grande_incienso' ? 'Grande/Inc.' : k.size === 'grande' ? 'Grande' : 'Chico'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50/50 min-h-[100px]">
                    {k.tasks.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">Sin tareas</div>
                    ) : (
                      <ul className="space-y-2">
                        {k.tasks.map((taskName, tIdx) => (
                          <li key={tIdx} className="flex justify-between items-center bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs gap-2">
                            <span className="text-xs font-semibold text-slate-700 break-words">{taskName}</span>
                            {results.length > 1 && (
                              <select 
                                onChange={(e) => moveTaskMobile(taskName, index, parseInt(e.target.value))}
                                value=""
                                className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] rounded-lg px-2 py-1 outline-none cursor-pointer max-w-[80px]"
                              >
                                <option value="" disabled>⇄ Mover</option>
                                {results.map((otherKid, otherIndex) => 
                                  otherIndex !== index ? (
                                    <option key={otherIndex} value={otherIndex}>{otherKid.name}</option>
                                  ) : null
                                )}
                              </select>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal de Edición de Monaguillo */}
      {editIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-t-8 border-t-brand-700 max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[fadeIn_0.2s_ease-out]">
            
            <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="text-lg font-bold text-slate-900">Editar Monaguillo</h4>
              <button onClick={() => setEditIndex(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
                />
              </div>

              {/* Nivel */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tamaño / Nivel</label>
                <select 
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="chico">Niño Chico</option>
                  <option value="grande">Niño Grande</option>
                  <option value="grande_incienso">Niño Grande (Sabe Incensar)</option>
                </select>
              </div>

              {/* Pre-asignaciones */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pre-asignar Tareas</label>
                <p className="text-slate-400 text-xs italic">Forzar a este monaguillo a realizar la tarea seleccionada. Se requiere que el objeto esté marcado en la Sección 2.</p>
                <div className="grid grid-cols-1 gap-2 mt-2 max-h-[180px] overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50">
                  {Object.keys(objectsConfig).filter(key => objectsConfig[key].checked).map(key => {
                    const obj = allObjects.find(o => o.id === key);
                    if (!obj) return null;
                    const isChecked = editPreassigned.includes(key);

                    return (
                      <label key={key} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePreassignToggle(key)}
                          className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700"
                        />
                        <span className="font-semibold text-slate-600">{obj.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setEditIndex(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-100 text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveKidChanges}
                className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm"
              >
                Guardar Cambios
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
}
