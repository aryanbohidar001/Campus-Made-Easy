import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { GraduationCap, ShieldCheck, UserCheck, BookOpen, Key, Shield } from 'lucide-react';

export const DemoCredentialsBanner: React.FC = () => {
  const { currentRole, loginAsDemo, isAuthenticated } = useAuth();

  const demoRoles: { role: UserRole; label: string; name: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'student',
      label: 'Student',
      name: 'Aryan Bohidar (CSE001)',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      role: 'teacher',
      label: 'Faculty',
      name: 'Dr. Rajesh Sharma',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600 text-white hover:bg-emerald-700',
    },
    {
      role: 'warden',
      label: 'Warden',
      name: 'Ramesh Patil',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'bg-amber-600 text-white hover:bg-amber-700',
    },
    {
      role: 'security',
      label: 'Security Guard',
      name: 'Officer Balwant Singh (Main Gate)',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-teal-600 text-white hover:bg-teal-700',
    },
    {
      role: 'admin',
      label: 'Admin',
      name: 'Dr. Arvind Mehra',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'bg-indigo-600 text-white hover:bg-indigo-700',
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white px-3 py-1.5 text-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Key className="w-3 h-3 mr-1" />
            Quick Demo Switcher
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px]">
            Explore all 4 role portals instantly with 1-click:
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {demoRoles.map((item) => {
            const isActive = isAuthenticated && currentRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => loginAsDemo(item.role)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shadow-sm ${
                  isActive
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 ' + item.color
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
                title={`Switch active view to ${item.label} (${item.name})`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
