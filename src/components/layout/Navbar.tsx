import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  GraduationCap,
  Bell,
  CheckCheck,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ExternalLink,
  Shield,
  Search,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  activeTab: _activeTab,
  setActiveTab,
}) => {
  const { currentUser, currentRole, logout } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id || n.userId === 'all'
  );

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'student':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Student</span>;
      case 'teacher':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Faculty</span>;
      case 'warden':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Warden</span>;
      case 'security':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">Security Officer</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Administrator</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">Member</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Sidebar toggle & Branding */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden focus:outline-hidden"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base text-slate-900 tracking-tight leading-none">
                    Campus Made Easy
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block leading-none mt-0.5">
                  Simplify Everyday Campus Life
                </p>
              </div>
            </div>
          </div>

          {/* Center search bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus notices, tickets, contacts..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Right section: Notifications & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Role Badge */}
            <div className="hidden sm:block">{getRoleBadge()}</div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                      {unreadNotificationCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications to display
                      </div>
                    ) : (
                      userNotifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.actionUrl) setActiveTab(notif.actionUrl);
                            setShowNotifications(false);
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start space-x-3 ${
                            !notif.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                              !notif.isRead ? 'bg-blue-600' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-900 leading-snug">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 text-center bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center space-x-1"
                    >
                      <span>View all notifications</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-hidden"
              >
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={currentUser?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none">
                    {currentUser?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-none mt-1">
                    {currentUser?.email}
                  </p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 z-50 py-1.5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1.5 flex items-center space-x-1.5">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-700 capitalize">
                        {currentUser?.role} Account
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
