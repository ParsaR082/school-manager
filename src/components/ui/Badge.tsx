import React from 'react';

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = 'slate',
  className = '',
  icon,
}: BadgeProps) {
  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    red: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles} ${className} persian-text`}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
}
