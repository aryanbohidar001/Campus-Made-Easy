import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  GraduationCap,
  CalendarCheck,
  Building2,
  Wrench,
  Megaphone,
  UtensilsCrossed,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  QrCode,
  DoorOpen,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenRaiseTicket: () => void;
  onOpenMessFeedback: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  setActiveTab,
  onOpenRaiseTicket,
  onOpenMessFeedback,
}) => {
  const { currentUser, studentProfile } = useAuth();
  const { attendance, tickets, announcements, messFeedbacks, notifications } = useData();

  // Compute average attendance
  const totalClasses = attendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const totalAttended = attendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallAttendancePercent = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 85;

  const myPendingTickets = tickets.filter(
    (t) => (t.userId === currentUser?.id || t.userName === currentUser?.name) &&
      (t.status === 'Submitted' || t.status === 'Assigned' || t.status === 'In Progress')
  );

  const newAnnouncementsCount = announcements.filter((a) => a.isImportant).length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Hello, {currentUser?.name || 'Student'} 👋
                </h1>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-0.5">
                Roll No: <span className="font-bold text-white">{studentProfile?.rollNumber || 'CSE2024089'}</span> &bull;{' '}
                {studentProfile?.course || 'B.Tech CSE'} ({studentProfile?.year || '3rd Year'}, {studentProfile?.semester || '5th Sem'})
              </p>
              <p className="text-blue-200/90 text-xs mt-1">
                {studentProfile?.branch || 'Computer Science & Engineering'} &bull; Room {studentProfile?.roomNumber || 'B-304'} ({studentProfile?.hostelName || 'Aryabhatta Boys Hostel'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <GraduationCap className="w-5 h-5 text-blue-200" />
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-200 leading-none">Current CGPA</p>
              <p className="text-xl font-extrabold text-white leading-none mt-1">
                {studentProfile?.cgpa || 8.78} <span className="text-xs font-normal text-blue-200">/ 10</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Statistics KPI Cards (Section 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Attendance"
          value={`${overallAttendancePercent}%`}
          subtitle="Requirement: >75%"
          icon={<CalendarCheck className="w-5 h-5" />}
          color={overallAttendancePercent >= 75 ? 'emerald' : 'rose'}
          badge={overallAttendancePercent >= 75 ? 'Good Standing' : 'Warning'}
          onClick={() => setActiveTab('attendance')}
        />
        <StatCard
          title="CGPA"
          value={studentProfile?.cgpa || 8.78}
          subtitle="Top 10% in CSE"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
          badge="Dean's List"
          onClick={() => setActiveTab('academic')}
        />
        <StatCard
          title="Hostel Room"
          value={studentProfile?.roomNumber || 'B-304'}
          subtitle={studentProfile?.bedNumber || 'Bed 2'}
          icon={<Building2 className="w-5 h-5" />}
          color="indigo"
          badge="Allocated"
          onClick={() => setActiveTab('hostel')}
        />
        <StatCard
          title="Complaints"
          value={myPendingTickets.length}
          subtitle="Active tickets"
          icon={<Wrench className="w-5 h-5" />}
          color={myPendingTickets.length > 0 ? 'amber' : 'emerald'}
          badge={myPendingTickets.length > 0 ? 'In Progress' : 'All Clear'}
          onClick={() => setActiveTab('maintenance')}
        />
        <StatCard
          title="Notices"
          value={announcements.length}
          subtitle={`${newAnnouncementsCount} Important`}
          icon={<Megaphone className="w-5 h-5" />}
          color="purple"
          badge="Updated Today"
          onClick={() => setActiveTab('announcements')}
        />
      </div>

      {/* Quick Actions Shortcuts (Section 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          <button
            onClick={() => setActiveTab('gatepass')}
            className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/90 text-left transition group shadow-xs"
          >
            <DoorOpen className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Smart Gate Pass</p>
            <p className="text-[11px] text-indigo-700 font-medium">Digital QR out-pass</p>
          </button>

          <button
            onClick={() => setActiveTab('hostel')}
            className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-left transition group"
          >
            <Building2 className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">View Hostel</p>
            <p className="text-[11px] text-slate-500">Room & warden</p>
          </button>

          <button
            onClick={onOpenMessFeedback}
            className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 text-left transition group"
          >
            <UtensilsCrossed className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Mess Feedback</p>
            <p className="text-[11px] text-slate-500">Rate today's meal</p>
          </button>

          <button
            onClick={onOpenRaiseTicket}
            className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition group"
          >
            <Wrench className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Raise Ticket</p>
            <p className="text-[11px] text-slate-500">Report issue</p>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-left transition group"
          >
            <Megaphone className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Announcements</p>
            <p className="text-[11px] text-slate-500">Campus notices</p>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition group shadow-xs"
          >
            <QrCode className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Mark Attendance</p>
            <p className="text-[11px] text-emerald-700 font-medium">QR & GPS Scan</p>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/70 text-left transition group"
          >
            <Calendar className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Timetable</p>
            <p className="text-[11px] text-slate-500">Today's classes</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Notifications panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Maintenance Tickets Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">My Maintenance Tickets</h3>
              </div>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myPendingTickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                No pending complaints! Everything is functioning properly.
              </div>
            ) : (
              <div className="space-y-3">
                {myPendingTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTab('maintenance')}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/30 transition cursor-pointer flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">#{ticket.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {ticket.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.priority === 'Urgent' || ticket.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ticket.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">{ticket.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ticket.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {ticket.status}
                      </span>
                      {ticket.assignedTo && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Assigned: {ticket.assignedTo}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Campus Bulletins */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Latest Campus Announcements</h3>
              </div>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setActiveTab('announcements')}
                  className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        {ann.category}
                      </span>
                      {ann.isImportant && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                          Important
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5">{ann.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Today's Schedule & Mess Preview */}
        <div className="space-y-6">
          {/* Today's Mess Menu Highlight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Mess Menu</h3>
              </div>
              <button
                onClick={() => setActiveTab('mess')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Weekly Menu
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <p className="font-bold text-amber-900">Breakfast (07:30 - 09:30 AM)</p>
                <p className="text-slate-600 mt-0.5">Idli, Sambar, Coconut Chutney, Boiled Eggs / Banana, Tea / Coffee</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <p className="font-bold text-amber-900">Lunch (12:30 - 02:30 PM)</p>
                <p className="text-slate-600 mt-0.5">Paneer Butter Masala, Dal Tadka, Jeera Rice, Chapati, Fresh Green Salad</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <p className="font-bold text-amber-900">Dinner (07:30 - 09:30 PM)</p>
                <p className="text-slate-600 mt-0.5">Aloo Gobi, Rajma Masala, Steamed Rice, Tandoori Roti, Gulab Jamun</p>
              </div>
            </div>

            <button
              onClick={onOpenMessFeedback}
              className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Submit Meal Rating & Feedback</span>
            </button>
          </div>

          {/* Quick Notifications Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Alerts</h3>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
