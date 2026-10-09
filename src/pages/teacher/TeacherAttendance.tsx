import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  AttendanceSession,
  AttendanceSessionRecord,
  CampusSettings,
} from '../../types';
import {
  createAttendanceSession,
  refreshSessionQr,
  closeAttendanceSession,
  subscribeToSession,
  subscribeToSessionRecords,
  getCampusSettings,
  getAllAttendanceSessions,
} from '../../services/attendanceService';
import { DEFAULT_CAMPUS_SETTINGS, formatDistance } from '../../utils/geolocation';
import { DynamicQrModal } from '../../components/attendance/DynamicQrModal';
import {
  QrCode,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  CheckCheck,
  RefreshCw,
  PlusCircle,
  Radio,
  MapPin,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Eye,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const { attendance, markAttendance } = useData();

  // Settings
  const [campusSettings, setCampusSettings] = useState<CampusSettings>(DEFAULT_CAMPUS_SETTINGS);

  // Active View Tab: 'qr' (Dynamic QR session), 'manual' (Traditional roll-call), 'history' (Past sessions)
  const [viewTab, setViewTab] = useState<'qr' | 'manual' | 'history'>('qr');

  // Form state for "Create Attendance Session"
  const [formBranch, setFormBranch] = useState<string>('Computer Science & Engineering');
  const [formSemester, setFormSemester] = useState<string>('5th');
  const [formSection, setFormSection] = useState<string>('Section A');
  const [formSubjectId, setFormSubjectId] = useState<string>('CS502');
  const [formSubjectName, setFormSubjectName] = useState<string>('Database Management Systems (DBMS)');
  const [formClassPeriod, setFormClassPeriod] = useState<string>('Period 2 (10:00 AM - 11:00 AM)');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(5);

  // Active session and live records
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [sessionRecords, setSessionRecords] = useState<AttendanceSessionRecord[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pastSessions, setPastSessions] = useState<AttendanceSession[]>([]);

  // Countdown timer for active session
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Traditional manual roll call state
  const students = allUsers.filter((u) => u.role === 'student');
  const [manualRollCall, setManualRollCall] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>(() => {
    const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    students.forEach((s) => {
      initial[s.id] = 'Present';
    });
    return initial;
  });
  const [savedNotice, setSavedNotice] = useState(false);

  // Load campus settings and past sessions on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getCampusSettings();
      setCampusSettings(settings);
    };
    loadSettings();

    const loadPastSessions = async () => {
      const all = await getAllAttendanceSessions();
      setPastSessions(all);
      // If there is an active session matching current teacher, select it
      const currentActive = all.find((s) => s.status === 'ACTIVE' && s.expiresAtTimestamp > Date.now());
      if (currentActive) {
        setActiveSession(currentActive);
      }
    };
    loadPastSessions();
  }, []);

  // Sync active session in real-time
  useEffect(() => {
    if (!activeSession?.sessionId) return;

    const unsubscribeSession = subscribeToSession(activeSession.sessionId, (updated) => {
      if (updated) {
        setActiveSession(updated);
      }
    });

    const unsubscribeRecords = subscribeToSessionRecords(activeSession.sessionId, (records) => {
      setSessionRecords(records);
    });

    return () => {
      unsubscribeSession();
      unsubscribeRecords();
    };
  }, [activeSession?.sessionId]);

  // Live timer tick
  useEffect(() => {
    if (!activeSession) {
      setTimeLeftSeconds(0);
      setIsExpired(false);
      return;
    }

    const checkTimer = () => {
      const remainingMs = activeSession.expiresAtTimestamp - Date.now();
      if (remainingMs <= 0 || activeSession.status === 'EXPIRED' || activeSession.status === 'CLOSED') {
        setTimeLeftSeconds(0);
        setIsExpired(true);
      } else {
        setTimeLeftSeconds(Math.ceil(remainingMs / 1000));
        setIsExpired(false);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.expiresAtTimestamp, activeSession?.status]);

  const formatTimer = (sec: number) => {
    if (sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Create Attendance Session
  const handleGenerateAttendanceQr = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const teacherName = currentUser?.name || 'Prof. Rajiv Nanda';
      const teacherId = currentUser?.id || 'teacher-1';

      const newSession = await createAttendanceSession({
        teacherId,
        teacherName,
        department: formBranch,
        branch: formBranch,
        semester: formSemester,
        section: formSection,
        subjectId: formSubjectId,
        subjectName: formSubjectName,
        classPeriod: formClassPeriod,
        date: formDate,
        durationMinutes: formDurationMinutes,
      });

      setActiveSession(newSession);
      setIsQrModalOpen(true);
      setPastSessions((prev) => [newSession, ...prev]);
    } catch (err) {
      console.error('Failed to create attendance session:', err);
      alert('Could not create attendance session. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Refresh QR Token for same session
  const handleRefreshQr = async (durationMinutes: number) => {
    if (!activeSession) return;
    const updated = await refreshSessionQr(activeSession.sessionId, durationMinutes);
    if (updated) {
      setActiveSession(updated);
    }
  };

  // Close Session
  const handleCloseSession = async () => {
    if (!activeSession) return;
    await closeAttendanceSession(activeSession.sessionId);
    setActiveSession((prev) => (prev ? { ...prev, status: 'CLOSED' } : null));
  };

  // Subject change helper
  const handleSubjectSelect = (subCode: string) => {
    setFormSubjectId(subCode);
    const found = campusSettings.subjects.find((s) => s.code === subCode);
    if (found) {
      setFormSubjectName(found.name);
    }
  };

  // Save manual attendance fallback
  const handleSaveManualAttendance = () => {
    Object.entries(manualRollCall).forEach(([studentId, status]) => {
      markAttendance(studentId, formSubjectId, status);
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  // Export CSV of session attendance
  const handleExportCsv = () => {
    if (!activeSession) return;
    const headers = ['Roll No', 'Student Name', 'Time', 'Location Status', 'Distance (m)', 'Status'];
    const rows = students.map((s) => {
      const rec = sessionRecords.find((r) => r.studentId === s.id);
      const roll = s.id === 'user-student-1' ? 'CSE001' : s.id === 'user-student-2' ? 'CSE002' : 'CSE003';
      if (rec) {
        return [roll, s.name, rec.time, 'Verified', `${rec.distanceFromCollege}m`, rec.status];
      }
      return [roll, s.name, '—', 'Not Recorded', '—', 'Absent'];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`Session: ${activeSession.sessionId} - ${activeSession.subjectName}`, `Date: ${activeSession.date}`, '']
        .join('\n') +
      '\n' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${activeSession.sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Attendance Control & Dynamic QR Hub</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              GPS Geofenced &le; {campusSettings.allowedRadius}m
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue time-limited dynamic QR codes, verify geolocated student check-ins, and prevent proxy attendance
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewTab('qr')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              viewTab === 'qr'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Dynamic QR</span>
          </button>
          <button
            onClick={() => setViewTab('manual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              viewTab === 'manual'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manual Register</span>
          </button>
          <button
            onClick={() => setViewTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              viewTab === 'history'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Session Logs</span>
          </button>
        </div>
      </div>

      {/* VIEW: DYNAMIC QR ATTENDANCE */}
      {viewTab === 'qr' && (
        <div className="space-y-6">
          {/* Active Session Overview Banner (if any) */}
          {activeSession && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                    Active Attendance Session
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {activeSession.sessionId}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeSession.subjectName}
                </h3>
                <p className="text-xs text-slate-300 flex items-center space-x-2">
                  <span>{activeSession.branch} • {activeSession.semester} Sem • {activeSession.section}</span>
                  <span>•</span>
                  <span>{activeSession.classPeriod}</span>
                </p>
              </div>

              {/* Status Tickers & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Timer Box */}
                <div
                  className={`px-4 py-2.5 rounded-2xl border flex flex-col items-center justify-center font-mono ${
                    isExpired
                      ? 'bg-rose-950/50 border-rose-600 text-rose-300'
                      : timeLeftSeconds <= 60
                      ? 'bg-amber-950/50 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                    {isExpired ? 'Status' : 'QR Expires In'}
                  </span>
                  <span className="text-xl font-bold tracking-tight">
                    {isExpired ? 'EXPIRED' : formatTimer(timeLeftSeconds)}
                  </span>
                </div>

                {/* Present Count Box */}
                <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                    Students Present
                  </span>
                  <span className="text-xl font-bold text-white">
                    <span className="text-emerald-400">{sessionRecords.length}</span> / {students.length}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 flex items-center space-x-1.5 transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Attendance QR</span>
                  </button>

                  <button
                    onClick={() => handleRefreshQr(5)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
                    title="Generate New QR Token"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCloseSession}
                    className="px-3 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition"
                    title="Close Session"
                  >
                    End Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grid: 1. Create Session Panel, 2. Live Session Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Attendance Session Form (Col 5) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/50">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create Attendance Session</h3>
                  <p className="text-[11px] text-slate-500">Configure lecture parameters & spawn secure QR</p>
                </div>
              </div>

              <form onSubmit={handleGenerateAttendanceQr} className="space-y-4 text-xs">
                {/* Department / Branch */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Department / Branch
                  </label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white font-medium text-slate-700"
                  >
                    {campusSettings.departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester & Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Semester
                    </label>
                    <select
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white font-medium text-slate-700"
                    >
                      {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((sem) => (
                        <option key={sem} value={sem}>
                          {sem} Semester
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Section
                    </label>
                    <select
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white font-medium text-slate-700"
                    >
                      {campusSettings.sections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => handleSubjectSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white font-medium text-slate-700"
                  >
                    {campusSettings.subjects.map((sub) => (
                      <option key={sub.code} value={sub.code}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class / Period & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Class / Period
                    </label>
                    <select
                      value={formClassPeriod}
                      onChange={(e) => setFormClassPeriod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white font-medium text-slate-700"
                    >
                      {campusSettings.classPeriods.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Lecture Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden bg-white font-medium text-slate-700"
                    />
                  </div>
                </div>

                {/* Attendance Duration */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                    Attendance Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 5, 10].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFormDurationMinutes(dur)}
                        className={`py-2 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center space-x-1.5 ${
                          formDurationMinutes === dur
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{dur} mins</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Default recommendation: 5 minutes</p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isGenerating ? 'CREATING SESSION...' : 'GENERATE ATTENDANCE QR'}</span>
                </button>
              </form>

              {/* Geofence Alert Notice */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>College Radius: <strong>{campusSettings.allowedRadius} meters</strong></span>
                </div>
                <span className="font-semibold text-emerald-700">Geofence Enforced</span>
              </div>
            </div>

            {/* Live Attendance List Table (Col 7) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Live Attendance Register</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Real-time verification telemetry for {activeSession ? activeSession.sessionId : 'current class'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {activeSession && (
                    <button
                      onClick={handleExportCsv}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                      title="Download Attendance CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </button>
                  )}
                  {activeSession && (
                    <button
                      onClick={() => setIsQrModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Show QR</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => {
                      const rec = sessionRecords.find((r) => r.studentId === student.id);
                      const rollNo = student.id === 'user-student-1' ? 'CSE001' : student.id === 'user-student-2' ? 'CSE002' : 'CSE003';
                      const isPresent = Boolean(rec);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {rollNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={
                                  student.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                                }
                                alt={student.name}
                                className="w-7 h-7 rounded-lg object-cover"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{student.name}</span>
                                <span className="text-[10px] text-slate-400">{student.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {rec ? rec.time : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {rec ? (
                              <div className="flex items-center space-x-1.5 text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-semibold text-[11px]">
                                  Verified ({formatDistance(rec.distanceFromCollege)})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Pending Scan</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isPresent ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Enrolled: <strong>{students.length} students</strong></span>
                <span className="text-emerald-700 font-bold">
                  Present: {sessionRecords.length} ({students.length > 0 ? Math.round((sessionRecords.length / students.length) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MANUAL ROLL CALL (TRADITIONAL) */}
      {viewTab === 'manual' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => handleSubjectSelect(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden bg-white"
                >
                  {campusSettings.subjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lecture Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                  students.forEach((s) => {
                    updated[s.id] = 'Present';
                  });
                  setManualRollCall(updated);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Present</span>
              </button>
              <button
                type="button"
                onClick={handleSaveManualAttendance}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Manual Roll</span>
              </button>
            </div>
          </div>

          {savedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Manual attendance saved and records updated!</span>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4 text-center">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const currentStatus = manualRollCall[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              student.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={student.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="font-bold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {student.id === 'user-student-1' ? 'CSE001' : student.id === 'user-student-2' ? 'CSE002' : 'CSE003'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setManualRollCall((prev) => ({ ...prev, [student.id]: 'Present' }))}
                            className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualRollCall((prev) => ({ ...prev, [student.id]: 'Absent' }))}
                            className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SESSION LOGS */}
      {viewTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Historical Attendance Sessions</h3>
              <p className="text-xs text-slate-500">Past generated dynamic QR sessions and completion logs</p>
            </div>
          </div>

          <div className="space-y-3">
            {pastSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance sessions created yet.</p>
            ) : (
              pastSessions.map((s) => (
                <div
                  key={s.sessionId}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                        {s.sessionId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'EXPIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{s.subjectName}</h4>
                    <p className="text-xs text-slate-500">
                      {s.branch} • {s.semester} Sem • {s.section} • {s.classPeriod} • Date: {s.date}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveSession(s);
                        setViewTab('qr');
                        setIsQrModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Inspect Session
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dynamic QR Presentation Modal */}
      {isQrModalOpen && activeSession && (
        <DynamicQrModal
          session={activeSession}
          presentCount={sessionRecords.length}
          totalStudents={students.length}
          onRefreshQr={handleRefreshQr}
          onCloseSession={handleCloseSession}
          onCloseModal={() => setIsQrModalOpen(false)}
          allowedRadius={campusSettings.allowedRadius}
        />
      )}
    </div>
  );
};
