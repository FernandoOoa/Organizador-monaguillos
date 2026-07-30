import React, { useState } from 'react';
import { Shield, Copy, Check, LogOut, RefreshCw, Users } from 'lucide-react';
import Button from '../ui/Button';
import { useToast } from '../ui/ToastContext';

export default function ParishHeader({
  parish,
  isAdmin,
  membersCount,
  virtualsCount,
  onLeaveParish
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const { addToast } = useToast();

  const handleCopyCode = () => {
    if (!parish?.inviteCode) return;
    navigator.clipboard.writeText(parish.inviteCode);
    setCopiedCode(true);
    addToast('Código de invitación copiado al portapapeles', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-brand-700" />
            {parish?.name}
          </h2>
          {isAdmin && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
              Administrador
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {membersCount} Miembros activos ({virtualsCount} virtuales)
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Código de Invitación */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between gap-3 flex-1 md:flex-none">
          <div className="pl-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Código</span>
            <span className="font-mono text-sm font-extrabold text-brand-700 tracking-wider">
              {parish?.inviteCode}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            icon={copiedCode ? Check : Copy}
            title="Copiar código de invitación"
          >
            {copiedCode ? 'Copiado' : 'Copiar'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLeaveParish}
          icon={LogOut}
          className="text-slate-600 hover:text-red-700 hover:bg-red-50"
        >
          Salir
        </Button>
      </div>
    </header>
  );
}
