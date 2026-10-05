import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-6 border-b border-slate-200/80">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight persian-text">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 persian-text">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 w-full sm:w-auto">{action}</div>}
    </div>
  );
}
