import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  onClick,
  badge,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-800',
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600 text-white',
      badge: 'bg-purple-100 text-purple-800',
    },
    rose: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600 text-white',
      badge: 'bg-rose-100 text-rose-800',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-100 text-indigo-800',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border ${colorMap.border} ${colorMap.bg} p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 shadow-xs ${colorMap.iconBg}`}>{icon}</div>
      </div>
      {badge && (
        <div className="mt-3">
          <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorMap.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
