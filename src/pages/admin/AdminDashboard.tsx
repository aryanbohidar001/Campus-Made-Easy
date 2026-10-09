import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  DoorClosed,
  Bed,
  Wrench,
  Megaphone,
  BarChart3,
  CreditCard,
  ShieldCheck,
  Building2,
  TrendingUp,
  Clock,
  QrCode,
  MapPin,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenNewUser: () => void;
  onOpenAnnouncement: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setActiveTab,
  onOpenNewUser,
  onOpenAnnouncement,
}) => {
  const { allUsers } = useAuth();
  const { rooms, tickets, announcements, fees, messFeedbacks } = useData();

  const studentsCount = allUsers.filter((u) => u.role === 'student').length;
  const teachersCount = allUsers.filter((u) => u.role === 'teacher').length;
  const wardensCount = allUsers.filter((u) => u.role === 'warden').length;

  const totalBeds = rooms.reduce((acc, curr) => acc + curr.totalBeds, 0);
  const occupiedBeds = rooms.reduce((acc, curr) => acc + curr.occupiedBeds, 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  const activeTickets = tickets.filter(
    (t) => t.status === 'Submitted' || t.status === 'Assigned' || t.status === 'In Progress'
  ).length;

  const resolvedTickets = tickets.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length;

  const totalFeeCollected = fees.reduce((acc, curr) => acc + curr.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg shadow-purple-500/15 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white ring-4 ring-white/20 shadow-md">
              <ShieldCheck className="w-10 h-10 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Campus Master Control
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                Central Administration Dashboard
              </h1>
              <p className="text-purple-200 text-xs mt-1">
                Institute of Technology & Science &bull; Academic Year 2026-2027 Active
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewUser}
              className="px-4 py-2 bg-white text-purple-900 font-bold rounded-xl text-xs hover:bg-purple-50 transition shadow-sm"
            >
              + Create New User
            </button>
            <button
              onClick={onOpenAnnouncement}
              className="px-4 py-2 bg-purple-600/60 hover:bg-purple-600 border border-purple-400/40 text-white font-bold rounded-xl text-xs transition"
            >
              Broadcast Notice
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics (Section 21) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={studentsCount || 420}
          subtitle="Enrolled under B.Tech & MCA"
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
          badge="Active Directory"
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          title="Total Faculty"
          value={teachersCount || 34}
          subtitle="Full-time academic staff"
          icon={<BookOpen className="w-5 h-5" />}
          color="emerald"
          badge="All Departments"
          onClick={() => setActiveTab('teachers')}
        />
        <StatCard
          title="Hostel Wardens"
          value={wardensCount || 4}
          subtitle="Residential supervisors"
          icon={<UserCheck className="w-5 h-5" />}
          color="amber"
          badge="Blocks B, G, R"
          onClick={() => setActiveTab('wardens')}
        />
        <StatCard
          title="Total Rooms"
          value={rooms.length || 300}
          subtitle={`${occupiedBeds} occupied / ${availableBeds} free`}
          icon={<DoorClosed className="w-5 h-5" />}
          color="purple"
          badge="90% Capacity"
          onClick={() => setActiveTab('hostels')}
        />
      </div>

      {/* Secondary KPI Metrics (Section 21) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Grievances"
          value={activeTickets}
          subtitle="Pending staff resolution"
          icon={<Wrench className="w-5 h-5" />}
          color={activeTickets > 0 ? 'rose' : 'emerald'}
          badge={activeTickets > 0 ? 'Urgent' : 'All Clear'}
          onClick={() => setActiveTab('maintenance')}
        />
        <StatCard
          title="Resolved Tickets"
          value={resolvedTickets}
          subtitle="Closed within SLA"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="emerald"
          badge="100% Rate"
          onClick={() => setActiveTab('maintenance')}
        />
        <StatCard
          title="Published Notices"
          value={announcements.length}
          subtitle="Campus announcements"
          icon={<Megaphone className="w-5 h-5" />}
          color="indigo"
          badge="Live Feed"
          onClick={() => setActiveTab('announcements')}
        />
        <StatCard
          title="Fee Revenue Cleared"
          value={`₹${(totalFeeCollected / 1000).toFixed(0)}k`}
          subtitle="Simulated tuition collection"
          icon={<CreditCard className="w-5 h-5" />}
          color="blue"
          badge="Audited"
          onClick={() => setActiveTab('fees')}
        />
      </div>

      {/* Dynamic QR & GPS Geofence Attendance System Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Institutional Security
            </span>
            <span className="text-xs font-semibold text-slate-400">GPS Geofenced Attendance Engine</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Dynamic QR Code & GPS-Based Student Attendance</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Eliminate proxy attendance with random token QR rotation (2-10 min expiry) and real-time device GPS geofence verification (&le; 150m campus radius).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('attendance')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center space-x-2 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Spawn Attendance QR</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance-settings')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-2 transition"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Configure Geofence</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Administrative Control Center
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setActiveTab('users')}
            className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50/50 text-left transition"
          >
            <Users className="w-5 h-5 text-purple-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-900">User Manager</p>
            <p className="text-[11px] text-slate-500">RBAC permissions</p>
          </button>

          <button
            onClick={() => setActiveTab('hostels')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 text-left transition"
          >
            <Building2 className="w-5 h-5 text-blue-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Hostels & Rooms</p>
            <p className="text-[11px] text-slate-500">Block infrastructure</p>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className="p-3 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50 hover:bg-rose-50/50 text-left transition"
          >
            <Wrench className="w-5 h-5 text-rose-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Maintenance Desk</p>
            <p className="text-[11px] text-slate-500">All campus tickets</p>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 text-left transition"
          >
            <Megaphone className="w-5 h-5 text-indigo-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Announcements</p>
            <p className="text-[11px] text-slate-500">Emergency bulletins</p>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-amber-50/50 text-left transition"
          >
            <CreditCard className="w-5 h-5 text-amber-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Fee Auditing</p>
            <p className="text-[11px] text-slate-500">Tuition balances</p>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/50 text-left transition"
          >
            <BarChart3 className="w-5 h-5 text-emerald-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-900">Reports & Export</p>
            <p className="text-[11px] text-slate-500">CSV data exports</p>
          </button>
        </div>
      </div>

      {/* Real-time Campus Operations Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Directory Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Recently Active Campus Users</span>
            </h3>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs font-semibold text-purple-600 hover:underline"
            >
              Manage all ({allUsers.length})
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {allUsers.slice(0, 4).map((u) => (
              <div key={u.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={u.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Backlog Monitor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-rose-600" />
              <span>Campus Maintenance Desk</span>
            </h3>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Open Desk ({tickets.length})
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {tickets.slice(0, 4).map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">#{t.id}</span>
                    <span className="font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium mt-0.5">{t.title}</p>
                  <p className="text-[11px] text-slate-400">{t.location} &bull; {t.userName}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'Resolved' || t.status === 'Closed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
