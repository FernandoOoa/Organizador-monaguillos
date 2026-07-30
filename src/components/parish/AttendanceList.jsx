import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, Trash2, Eye } from 'lucide-react';
import Button from '../ui/Button';
import MemberSkillsModal from './MemberSkillsModal';

export default function AttendanceList({
  members,
  virtuals,
  presentKids,
  currentUserId,
  isAdmin,
  onTogglePresence,
  onMoveKid,
  onKickMember,
  onDeleteVirtual,
  onOpenAddVirtualModal
}) {
  const [inspectMonaguillo, setInspectMonaguillo] = useState(null);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-700" /> Asistencia y Registro
        </h3>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAddVirtualModal}
            icon={UserPlus}
            className="text-brand-700 hover:bg-brand-50"
            title="Añadir monaguillo virtual"
          >
            Virtual
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {/* Miembros reales */}
        {members.map(member => {
          const isPresent = presentKids.some(k => k.id === member.uid);
          return (
            <div
              key={member.uid}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isPresent ? 'border-brand-300 bg-brand-50/20 shadow-xs' : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={() => onTogglePresence({
                    id: member.uid,
                    name: member.liturgicalName || member.displayName,
                    size: member.size || 'chico',
                    skills: member.skills || []
                  })}
                  className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700 cursor-pointer flex-shrink-0"
                  title="Presente hoy"
                />
                <img src={member.photoURL || 'https://via.placeholder.com/150'} alt={member.displayName} className="w-6 h-6 rounded-full border" />
                <button
                  type="button"
                  onClick={() => setInspectMonaguillo(member)}
                  className="text-xs font-bold text-slate-700 hover:text-brand-700 truncate text-left cursor-pointer transition-colors"
                  title="Ver ficha de habilidades"
                >
                  {member.liturgicalName || member.displayName}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase">
                  {member.size === 'grande_incienso' ? 'Grande/Inc' : member.size}
                </span>
                <button
                  type="button"
                  onClick={() => setInspectMonaguillo(member)}
                  className="p-1 text-slate-400 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Ver habilidades que sabe hacer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {isAdmin && member.uid !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => onKickMember(member.uid)}
                    className="text-slate-300 hover:text-red-600 transition-colors p-1"
                    title="Expulsar de la parroquia"
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
            <div
              key={v.id}
              className={`flex items-center justify-between p-3 rounded-2xl border border-dashed transition-all ${
                isPresent ? 'border-amber-400 bg-amber-50/30 shadow-xs' : 'border-amber-200 bg-amber-50/10'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={() => onTogglePresence({
                    id: v.id,
                    name: v.name,
                    size: v.size || 'chico',
                    skills: v.skills || []
                  })}
                  className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700 cursor-pointer flex-shrink-0"
                  title="Presente hoy"
                />
                <button
                  type="button"
                  onClick={() => setInspectMonaguillo(v)}
                  className="text-xs font-bold text-amber-950 hover:text-brand-700 truncate text-left cursor-pointer transition-colors"
                  title="Ver ficha de habilidades"
                >
                  👤 {v.name}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold text-amber-600 uppercase">
                  {v.size === 'grande_incienso' ? 'Grande/Inc' : v.size} (V)
                </span>
                <button
                  type="button"
                  onClick={() => setInspectMonaguillo(v)}
                  className="p-1 text-amber-600 hover:text-brand-700 hover:bg-amber-100 rounded-lg transition-colors"
                  title="Ver habilidades que sabe hacer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDeleteVirtual(v.id)}
                    className="text-amber-300 hover:text-red-600 transition-colors p-1"
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

      {/* Modal Ficha Litúrgica de Habilidades */}
      <MemberSkillsModal
        isOpen={!!inspectMonaguillo}
        onClose={() => setInspectMonaguillo(null)}
        monaguillo={inspectMonaguillo}
      />
    </div>
  );
}
