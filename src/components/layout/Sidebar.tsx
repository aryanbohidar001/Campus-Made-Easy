import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Building2,
  UtensilsCrossed,
  Wrench,
  Megaphone,
  CalendarCheck,
  Calendar,
  GraduationCap,
  BookOpen,
  CreditCard,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  Users,
  Bed,
  DoorClosed,
  UserPlus,
  BarChart3,
  UserCheck,
  ClipboardList,
  QrCode,
  MapPin,
  DoorOpen,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
}) => {
  const { currentRole, logout } = useAuth();
  const { unreadNotificationCount, tickets } = useData();

  const pendingTicketsCount = tickets.filter(
    (t) => t.status === 'Submitted' || t.status === 'Assigned' || t.status === 'In Progress'
  ).length;

  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'gatepass', label: '🚪 Smart Gate Pass', icon: <DoorOpen className="w-4 h-4" /> },
          { id: 'hostel', label: 'Hostel', icon: <Building2 className="w-4 h-4" /> },
          { id: 'mess', label: 'Mess & Food', icon: <UtensilsCrossed className="w-4 h-4" /> },
          {
            id: 'maintenance',
            label: 'Maintenance',
            icon: <Wrench className="w-4 h-4" />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'attendance', label: 'Mark Attendance (QR)', icon: <QrCode className="w-4 h-4" /> },
          { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" /> },
          { id: 'academic', label: 'Academic & Marks', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'materials', label: 'Study Materials', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'fees', label: 'Fees & Dues', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'documents', label: 'Documents & IDs', icon: <FileText className="w-4 h-4" /> },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="w-4 h-4" />,
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          },
          { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];

      case 'teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'attendance', label: 'Dynamic QR Attendance', icon: <QrCode className="w-4 h-4" /> },
          { id: 'gatepass-requests', label: 'Gate Pass Approvals', icon: <DoorOpen className="w-4 h-4" /> },
          { id: 'students', label: 'Student Directory', icon: <Users className="w-4 h-4" /> },
          { id: 'marks', label: 'Marks & Grading', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'materials', label: 'Study Materials', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'timetable', label: 'Teaching Schedule', icon: <Calendar className="w-4 h-4" /> },
          { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'requests', label: 'Student Requests', icon: <ClipboardList className="w-4 h-4" /> },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="w-4 h-4" />,
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          },
          { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];

      case 'warden':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'gatepass-requests', label: 'Smart Gate Pass', icon: <DoorOpen className="w-4 h-4" /> },
          { id: 'hostels', label: 'Hostel Buildings', icon: <Building2 className="w-4 h-4" /> },
          { id: 'rooms', label: 'Room Management', icon: <DoorClosed className="w-4 h-4" /> },
          { id: 'allocations', label: 'Student Allocation', icon: <Bed className="w-4 h-4" /> },
          {
            id: 'complaints',
            label: 'Hostel Complaints',
            icon: <Wrench className="w-4 h-4" />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'mess', label: 'Mess & Feedback', icon: <UtensilsCrossed className="w-4 h-4" /> },
          { id: 'announcements', label: 'Notices & Bulletins', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'visitors', label: 'Visitor Register', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'reports', label: 'Occupancy Reports', icon: <BarChart3 className="w-4 h-4" /> },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="w-4 h-4" />,
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          },
          { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];

      case 'security':
        return [
          { id: 'gatepass-security', label: 'Gate Scanner & QR', icon: <Shield className="w-4 h-4" /> },
          { id: 'gatepass-outside', label: 'Outside & Overdue', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'visitors', label: 'Visitor Register', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'announcements', label: 'Campus Notices', icon: <Megaphone className="w-4 h-4" /> },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="w-4 h-4" />,
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          },
          { id: 'profile', label: 'Officer Profile', icon: <User className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];

      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'gatepass-requests', label: 'Gate Pass Oversight', icon: <DoorOpen className="w-4 h-4" /> },
          { id: 'gatepass-security', label: 'Security Gate Scanner', icon: <Shield className="w-4 h-4" /> },
          { id: 'attendance', label: 'Dynamic QR Attendance', icon: <QrCode className="w-4 h-4" /> },
          { id: 'attendance-settings', label: 'Attendance & Geofence', icon: <MapPin className="w-4 h-4" /> },
          { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
          { id: 'students', label: 'Manage Students', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'teachers', label: 'Manage Faculty', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'wardens', label: 'Manage Wardens', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'hostels', label: 'Hostel Infrastructure', icon: <Building2 className="w-4 h-4" /> },
          { id: 'rooms', label: 'Rooms & Beds', icon: <DoorClosed className="w-4 h-4" /> },
          { id: 'mess', label: 'Mess Oversight', icon: <UtensilsCrossed className="w-4 h-4" /> },
          {
            id: 'maintenance',
            label: 'Campus Tickets',
            icon: <Wrench className="w-4 h-4" />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'announcements', label: 'Announcements Hub', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'timetable', label: 'Academics & Timetable', icon: <Calendar className="w-4 h-4" /> },
          { id: 'materials', label: 'Course Materials', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'fees', label: 'Fee Administration', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'documents', label: 'Student Documents', icon: <FileText className="w-4 h-4" /> },
          { id: 'reports', label: 'Analytics & Reports', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
        ];

      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleTheme = () => {
    switch (currentRole) {
      case 'student':
        return {
          activeBg: 'bg-blue-600 text-white shadow-xs',
          hoverBg: 'hover:bg-blue-50 hover:text-blue-700',
          textSub: 'text-blue-600',
        };
      case 'teacher':
        return {
          activeBg: 'bg-emerald-600 text-white shadow-xs',
          hoverBg: 'hover:bg-emerald-50 hover:text-emerald-700',
          textSub: 'text-emerald-600',
        };
      case 'warden':
        return {
          activeBg: 'bg-amber-600 text-white shadow-xs',
          hoverBg: 'hover:bg-amber-50 hover:text-amber-700',
          textSub: 'text-amber-600',
        };
      case 'security':
        return {
          activeBg: 'bg-teal-600 text-white shadow-xs',
          hoverBg: 'hover:bg-teal-50 hover:text-teal-700',
          textSub: 'text-teal-600',
        };
      case 'admin':
        return {
          activeBg: 'bg-purple-600 text-white shadow-xs',
          hoverBg: 'hover:bg-purple-50 hover:text-purple-700',
          textSub: 'text-purple-600',
        };
      default:
        return {
          activeBg: 'bg-blue-600 text-white shadow-xs',
          hoverBg: 'hover:bg-blue-50 hover:text-blue-700',
          textSub: 'text-blue-600',
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 z-40 h-[100dvh] md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {currentRole} Portal
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? theme.activeBg
                    : `text-slate-600 ${theme.hoverBg}`
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar footer: Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
