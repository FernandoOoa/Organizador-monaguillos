import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon = null,
  onClick,
  type = 'button',
  title = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-brand-700 hover:bg-brand-800 text-white shadow-md shadow-brand-700/20 hover:shadow-brand-700/35',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm',
    accent: 'bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-950 text-white shadow-lg shadow-brand-700/25',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs',
    ghost: 'text-slate-600 hover:text-brand-700 hover:bg-brand-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20',
    whatsapp: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 border-transparent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
