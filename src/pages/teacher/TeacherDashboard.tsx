import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Users,
  CalendarCheck,
  Calendar,
  GraduationCap,
  BookOpen,
  Megaphone,
  Clock,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  QrCode,
  DoorOpen,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

interface TeacherDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenUploadMaterial: () => void;
  onOpenAnnouncement: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  setActiveTab,
  onOpenUploadMaterial,
  onOpenAnnouncement,
}) => {
  const { currentUser, allUsers } = useAuth();
  const { timetable, attendance, studyMaterials, hostelRequests } = useData();

  const studentsCount = allUsers.filter((u) => u.role === 'student').length;
  const myClassesToday = timetable.filter((t) => t.faculty.includes('Sharma') || t.day === 'Monday');

  const pendingRequests = hostelRequests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-800 p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/15 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
              }
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome, {currentUser?.name || 'Dr. Rajesh Sharma'} 👨‍🏫
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium mt-0.5">
                Associate Professor &bull; {currentUser?.department || 'Computer Science & Engineering'}
              </p>
              <p className="text-emerald-200/90 text-xs mt-1">
                Faculty ID: FAC-CSE-042 &bull; Active Courses: Operating Systems (CS501), Systems Lab
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase font-bold text-emerald-200 leading-none">Today's Lectures</p>
            <p className="text-xl font-extrabold text-white leading-none mt-1">
              3 Classes <span className="text-xs font-normal text-emerald-200">Scheduled</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Section 19) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Students"
          value={studentsCount || 68}
          subtitle="Enrolled in your subjects"
          icon={<Users className="w-5 h-5" />}
          color="emerald"
          badge="Active Batches"
          onClick={() => setActiveTab('students')}
        />
        <StatCard
          title="Today's Classes"
          value={myClassesToday.length}
          subtitle="Monday schedule"
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
          badge="Next: 09:00 AM"
          onClick={() => setActiveTab('timetable')}
        />
        <StatCard
          title="Avg. Attendance"
          value="84.2%"
          subtitle="Across CS501"
          icon={<CalendarCheck className="w-5 h-5" />}
          color="indigo"
          badge="Target >75%"
          onClick={() => setActiveTab('attendance')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="Leave & academic NOCs"
          icon={<ClipboardList className="w-5 h-5" />}
          color="amber"
          badge="Awaiting review"
          onClick={() => setActiveTab('requests')}
        />
        <StatCard
          title="Uploaded Materials"
          value={studyMaterials.length}
          subtitle="Notes & assignments"
          icon={<BookOpen className="w-5 h-5" />}
          color="purple"
          badge="Unit 3 Active"
          onClick={() => setActiveTab('materials')}
        />
      </div>

      {/* Quick Action Shortcuts (Section 19) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Faculty Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('attendance')}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition group shadow-xs"
          >
            <QrCode className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Dynamic QR Attendance</p>
            <p className="text-[11px] text-emerald-700 font-medium">Create lecture session</p>
          </button>

          <button
            onClick={() => setActiveTab('gatepass-requests')}
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition group shadow-xs"
          >
            <DoorOpen className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Gate Pass Approvals</p>
            <p className="text-[11px] text-indigo-700 font-medium">Review out-passes</p>
          </button>

          <button
            onClick={onOpenUploadMaterial}
            className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100 text-left transition group"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Upload Material</p>
            <p className="text-[11px] text-slate-500">Share slides or PDF notes</p>
          </button>

          <button
            onClick={() => setActiveTab('marks')}
            className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-left transition group"
          >
            <GraduationCap className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Add Marks</p>
            <p className="text-[11px] text-slate-500">Grading & assessments</p>
          </button>

          <button
            onClick={onOpenAnnouncement}
            className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100 text-left transition group"
          >
            <Megaphone className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">Announcement</p>
            <p className="text-[11px] text-slate-500">Broadcast class notices</p>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100 text-left transition group"
          >
            <Users className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-900">View Students</p>
            <p className="text-[11px] text-slate-500">Search student roster</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Attendance Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Teaching Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Today's Teaching Schedule (Monday)</span>
            </h3>
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Full Schedule
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Operating Systems (CS501)</span>
                <p className="text-slate-500 mt-0.5">Lecture Hall 101 &bull; 3rd Year B.Tech CSE</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  09:00 - 10:00 AM
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">OS & Systems Lab (Batch A)</span>
                <p className="text-slate-500 mt-0.5">Computing Lab 3 &bull; Hands-on POSIX Threads</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  11:30 AM - 01:30 PM
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Project Mentoring Hours</span>
                <p className="text-slate-500 mt-0.5">Faculty Cabin 204 &bull; Open Consultation</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  03:30 - 05:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Attendance Status by Subject</span>
            </h3>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Take Roll Call
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {attendance.slice(0, 3).map((a) => {
              const pct = Math.round((a.attendedClasses / a.totalClasses) * 100);
              return (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{a.subjectName}</span>
                    <span className="font-bold text-emerald-600">{pct}% Avg Attendance</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Conducted: {a.totalClasses} classes</span>
                    <span>Student: Aman Sahu ({a.attendedClasses} attended)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
