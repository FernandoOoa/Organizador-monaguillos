import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ParishService } from '../services/ParishService';
import { allObjects } from '../config/liturgicalObjects';
import { assignParishTasks } from '../utils/parishAssignmentAlgorithm';
import { db } from '../config/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';

import Button from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';
import ParishHeader from '../components/parish/ParishHeader';
import AttendanceList from '../components/parish/AttendanceList';
import LiturgyConfig from '../components/parish/LiturgyConfig';
import AssignmentsView from '../components/parish/AssignmentsView';
import VirtualMemberModal from '../components/parish/VirtualMemberModal';
import { Shield, PlusCircle, LogIn, Users } from 'lucide-react';

export default function ParishDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();

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

  // Estados de modal
  const [showAddVirtualModal, setShowAddVirtualModal] = useState(false);

  const parishId = userProfile?.parishId;
  const isAdmin = parish && parish.adminId === currentUser?.uid;

  // Escuchar la Parroquia, Miembros Reales y Virtuales en tiempo real
  useEffect(() => {
    if (!parishId) {
      setParish(null);
      setMembers([]);
      setVirtuals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Suscripción a la Parroquia
    const unsubParish = onSnapshot(doc(db, 'parishes', parishId), (docSnap) => {
      if (docSnap.exists()) {
        setParish(docSnap.data());
      } else {
        setParish(null);
      }
      setLoading(false);
    });

    // 2. Suscripción a los miembros reales
    const qMembers = query(collection(db, 'users'), where('parishId', '==', parishId));
    const unsubMembers = onSnapshot(qMembers, (querySnap) => {
      const mems = [];
      querySnap.forEach((d) => mems.push(d.data()));
      setMembers(mems);
    });

    // 3. Suscripción a los miembros virtuales
    const qVirtuals = collection(db, 'parishes', parishId, 'virtuals');
    const unsubVirtuals = onSnapshot(qVirtuals, (querySnap) => {
      const virts = [];
      querySnap.forEach((d) => virts.push({ id: d.id, ...d.data() }));
      setVirtuals(virts);
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
      addToast('Parroquia creada exitosamente', 'success');
      setParishNameInput('');
    } catch (err) {
      addToast("Error al crear parroquia: " + err.message, 'error');
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
      addToast('Te has unido a la parroquia exitosamente', 'success');
      setInviteCodeInput('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Salir de la Parroquia
  const handleLeaveParish = async () => {
    if (window.confirm("¿Seguro que deseas salir de esta parroquia?")) {
      try {
        await ParishService.leaveParish(currentUser.uid);
        addToast('Has salido de la parroquia', 'info');
      } catch (err) {
        addToast("Error al salir: " + err.message, 'error');
      }
    }
  };

  // Expulsar a un Miembro (Admin)
  const handleKickMember = async (memberId) => {
    if (window.confirm("¿Seguro que deseas expulsar a este miembro de la parroquia?")) {
      try {
        await ParishService.kickMember(memberId);
        addToast('Miembro expulsado', 'info');
      } catch (err) {
        addToast("Error al expulsar: " + err.message, 'error');
      }
    }
  };

  // Añadir Monaguillo Virtual (Admin)
  const handleAddVirtual = async (name, size, skills) => {
    await ParishService.addVirtualMonaguillo(parishId, name, size, skills);
  };

  // Eliminar Monaguillo Virtual (Admin)
  const handleDeleteVirtual = async (id) => {
    if (window.confirm("¿Eliminar este monaguillo virtual?")) {
      try {
        await ParishService.deleteVirtualMonaguillo(parishId, id);
        addToast('Monaguillo virtual eliminado', 'info');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  // Toggle Monaguillo Presente
  const toggleMonaguilloPresence = (kidData) => {
    const isPresent = presentKids.some(k => k.id === kidData.id);
    if (isPresent) {
      setPresentKids(prev => prev.filter(k => k.id !== kidData.id));
    } else {
      setPresentKids(prev => [...prev, kidData]);
    }
  };

  // Reordenar monaguillos presentes
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

  // Aplicar Presets Litúrgicos
  const handleApplyPreset = (presetIds) => {
    const newConfig = { ...objectsConfig };
    allObjects.forEach(obj => {
      newConfig[obj.id] = {
        checked: presetIds.includes(obj.id),
        qty: newConfig[obj.id]?.qty || obj.defaultQty || 1
      };
    });
    setObjectsConfig(newConfig);
    addToast('Plantilla litúrgica aplicada', 'info');
  };

  // Generar Asignaciones
  const handleGenerateAssignments = async () => {
    setErrorMsg('');

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

    const result = assignParishTasks(presentMonaguillos, selectedIds, qtys);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    const assignmentsList = result.assignedKids.map(kid => ({
      monaguilloId: kid.id,
      name: kid.originalName,
      size: kid.size,
      tasks: kid.tasks
    }));

    try {
      await ParishService.saveParishAssignments(
        parishId, 
        assignmentsList, 
        userProfile?.liturgicalName || currentUser?.displayName || 'Desconocido',
        result.warnings
      );
      addToast('Asignación generada y guardada en la nube', 'success');
    } catch (err) {
      addToast("Error al guardar asignaciones: " + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargando parroquia...</p>
        </div>
      </div>
    );
  }

  // --- VISTA 1: El usuario NO pertenece a ninguna parroquia ---
  if (!parishId || !parish) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-8 animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-brand-50 text-brand-700 rounded-2xl">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Bienvenido al Organizador Parroquial
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Únete a tu parroquia con un código de invitación o crea una nueva si eres el coordinador del equipo de monaguillos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full">
          {/* Opción A: Crear Parroquia */}
          <form onSubmit={handleCreateParish} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Crear una nueva Parroquia</h3>
              <p className="text-xs text-slate-500">
                Crea el grupo de tu iglesia. Te convertirás en Administrador y obtendrás un código para invitar a tus monaguillos.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre de la Parroquia</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Parroquia San José"
                  value={parishNameInput}
                  onChange={(e) => setParishNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-brand-700 outline-none"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="accent"
              loading={actionLoading}
              className="w-full py-3"
            >
              Crear Parroquia
            </Button>
          </form>

          {/* Opción B: Unirse a Parroquia */}
          <form onSubmit={handleJoinParish} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <LogIn className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Unirse a una Parroquia</h3>
              <p className="text-xs text-slate-500">
                Pídele al coordinador o administrador de tu parroquia el código de 6 dígitos para registrarte en el equipo.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Código de Invitación</label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Ej. X7K29P"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold uppercase tracking-wider focus:ring-2 focus:ring-brand-700 outline-none font-mono"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="secondary"
              loading={actionLoading}
              className="w-full py-3"
            >
              Unirme a la Parroquia
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- VISTA 2: El usuario PERTENECE a una Parroquia ---
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Encabezado Principal */}
      <ParishHeader
        parish={parish}
        isAdmin={isAdmin}
        membersCount={members.length}
        virtualsCount={virtuals.length}
        onLeaveParish={handleLeaveParish}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: Asistencia y Miembros */}
        <div className="lg:col-span-1 space-y-6">
          <AttendanceList
            members={members}
            virtuals={virtuals}
            presentKids={presentKids}
            currentUserId={currentUser.uid}
            isAdmin={isAdmin}
            onTogglePresence={toggleMonaguilloPresence}
            onMoveKid={moveKid}
            onKickMember={handleKickMember}
            onDeleteVirtual={handleDeleteVirtual}
            onOpenAddVirtualModal={() => setShowAddVirtualModal(true)}
          />
        </div>

        {/* COLUMNA 2 Y 3: Configuración Litúrgica y Asignaciones */}
        <div className="lg:col-span-2 space-y-8">
          <LiturgyConfig
            objectsConfig={objectsConfig}
            presentKids={presentKids}
            errorMsg={errorMsg}
            onObjectCheck={handleObjectCheck}
            onObjectQtyChange={handleObjectQtyChange}
            onMoveKid={moveKid}
            onRemoveKid={toggleMonaguilloPresence}
            onGenerateAssignments={handleGenerateAssignments}
            onApplyPreset={handleApplyPreset}
          />

          <AssignmentsView
            parish={parish}
            currentUserId={currentUser.uid}
          />
        </div>
      </div>

      {/* Modal Agregar Monaguillo Virtual */}
      <VirtualMemberModal
        isOpen={showAddVirtualModal}
        onClose={() => setShowAddVirtualModal(false)}
        onAddVirtual={handleAddVirtual}
      />
    </div>
  );
}
