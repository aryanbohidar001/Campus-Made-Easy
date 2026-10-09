import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Building2,
  Bed,
  DoorClosed,
  Wrench,
  UtensilsCrossed,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  DoorOpen,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

interface WardenDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenNewRoom: () => void;
  onOpenNotice: () => void;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({
  setActiveTab,
  onOpenNewRoom,
  onOpenNotice,
}) => {
  const { currentUser } = useAuth();
  const { hostels, rooms, tickets, messFeedbacks, visitors } = useData();

  const totalBeds = rooms.reduce((acc, curr) => acc + curr.totalBeds, 0);
  const occupiedBeds = rooms.reduce((acc, curr) => acc + curr.occupiedBeds, 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  const pendingComplaints = tickets.filter(
    (t) => t.status === 'Submitted' || t.status === 'Assigned' || t.status === 'In Progress'
  ).length;

  const resolvedComplaints = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Warden Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 p-6 sm:p-8 text-white shadow-lg shadow-amber-500/15 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
              }
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Hostel Administration Desk
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm font-medium mt-0.5">
                {currentUser?.name || 'Ramesh Patil'} &bull; Chief Warden, Aryabhatta Boys Hostel
              </p>
              <p className="text-amber-200/90 text-xs mt-1">
                Zone: Block B & R &bull; Active Resident Inmates: 356 Students
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase font-bold text-amber-200 leading-none">Occupancy Rate</p>
            <p className="text-xl font-extrabold text-white leading-none mt-1">
              90.0% <span className="text-xs font-normal text-amber-200">Capacity</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Section 20) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Rooms"
          value={rooms.length || 300}
          subtitle="Across Block B & G"
          icon={<DoorClosed className="w-5 h-5" />}
          color="blue"
          badge="Capacity 240+"
          onClick={() => setActiveTab('rooms')}
        />
        <StatCard
          title="Occupied Beds"
          value={occupiedBeds || 216}
          subtitle="Allocated residents"
          icon={<Bed className="w-5 h-5" />}
          color="emerald"
          badge="Verified Students"
          onClick={() => setActiveTab('allocations')}
        />
        <StatCard
          title="Available Beds"
          value={availableBeds || 24}
          subtitle="Vacant for allotment"
          icon={<Building2 className="w-5 h-5" />}
          color="indigo"
          badge="Ready for Move-In"
          onClick={() => setActiveTab('allocations')}
        />
        <StatCard
          title="Pending Complaints"
          value={pendingComplaints}
          subtitle="Requires attention"
          icon={<Wrench className="w-5 h-5" />}
          color={pendingComplaints > 0 ? 'rose' : 'emerald'}
          badge={pendingComplaints > 0 ? 'Action Needed' : 'Zero Backlog'}
          onClick={() => setActiveTab('complaints')}
        />
        <StatCard
          title="Resolved Complaints"
          value={resolvedComplaints}
          subtitle="Satisfied residents"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="amber"
          badge="100% Rate"
          onClick={() => setActiveTab('complaints')}
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Warden Quick Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('gatepass-requests')}
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition group shadow-xs"
          >
            <DoorOpen className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Gate Pass Requests</p>
            <p className="text-[11px] text-indigo-700 font-medium">Approve & track out-passes</p>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100 text-left transition"
          >
            <Bed className="w-5 h-5 text-amber-600 mb-2" />
            <p className="text-xs font-bold text-slate-900">Allocate Student</p>
            <p className="text-[11px] text-slate-500">Assign bed & room</p>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100 text-left transition"
          >
            <Wrench className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs font-bold text-slate-900">Manage Tickets</p>
            <p className="text-[11px] text-slate-500">Assign electricians/plumbers</p>
          </button>

          <button
            onClick={() => setActiveTab('mess')}
            className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-left transition"
          >
            <UtensilsCrossed className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-xs font-bold text-slate-900">Mess Menu & Reviews</p>
            <p className="text-[11px] text-slate-500">Update menu & reply</p>
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100 text-left transition"
          >
            <UserCheck className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs font-bold text-slate-900">Visitor Register</p>
            <p className="text-[11px] text-slate-500">Log entry & exit</p>
          </button>

          <button
            onClick={onOpenNotice}
            className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100 text-left transition"
          >
            <Building2 className="w-5 h-5 text-rose-600 mb-2" />
            <p className="text-xs font-bold text-slate-900">Hostel Notice</p>
            <p className="text-[11px] text-slate-500">Post curfew / rules</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Pending Grievances & Recent Mess Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Grievances */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Urgent Maintenance Grievances</span>
            </h3>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {tickets.slice(0, 3).map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">#{t.id}</span>
                    <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium mt-1">{t.title}</p>
                  <p className="text-slate-400 text-[11px]">{t.location} &bull; By {t.userName}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Mess Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Latest Mess Food Feedback</span>
            </h3>
            <button
              onClick={() => setActiveTab('mess')}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Reply & Manage
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {messFeedbacks.slice(0, 3).map((fb) => (
              <div key={fb.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{fb.userName} ({fb.meal})</span>
                  <span className="font-bold text-amber-600">{fb.rating} ★</span>
                </div>
                <p className="text-slate-600">{fb.comment}</p>
                {fb.reply ? (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Replied: {fb.reply}
                  </p>
                ) : (
                  <span className="text-[10px] text-rose-500 font-semibold">Needs response</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
