import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  className = ''
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    grande: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    incienso: 'bg-amber-50 text-amber-800 border-amber-200',
    chico: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <span className={`inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
