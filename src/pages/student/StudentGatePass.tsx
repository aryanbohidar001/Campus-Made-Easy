import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GatePass, GatePassType } from '../../types';
import {
  createGatePass,
  subscribeToAllGatePasses,
} from '../../services/gatePassService';
import { DigitalGatePassModal } from '../../components/gatepass/DigitalGatePassModal';
import {
  DoorOpen,
  Send,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

export const StudentGatePass: React.FC = () => {
  const { currentUser, studentProfile } = useAuth();
  const { addNotification } = useData();

  // All gate passes
  const [allPasses, setAllPasses] = useState<GatePass[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const studentName = currentUser?.name || 'Aryan Bohidar';
  const rollNumber = studentProfile?.rollNumber || 'CSE001';
  const [department, setDepartment] = useState(
    studentProfile?.branch || 'Computer Science & Engineering'
  );
  const [semester, setSemester] = useState(studentProfile?.semester || '5th');
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [type, setType] = useState<GatePassType>('Normal');
  const [leavingDate, setLeavingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [leavingTime, setLeavingTime] = useState('02:00 PM');
  const [expectedReturnTime, setExpectedReturnTime] = useState('06:00 PM');
  const [optionalNote, setOptionalNote] = useState('');
  const [supportingDocName, setSupportingDocName] = useState('');

  // Active viewing modal
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(null);

  // Success alert state
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // Subscribe to gate passes
  useEffect(() => {
    const unsub = subscribeToAllGatePasses((passes) => {
      setAllPasses(passes);
    });
    return () => unsub();
  }, []);

  // Filter passes belonging to current student
  const studentPasses = allPasses.filter(
    (p) =>
      p.studentId === currentUser?.id ||
      p.rollNumber === rollNumber ||
      p.studentName === studentName
  );

  // Active / Approved pass ready to show QR
  const activeApprovedPass = studentPasses.find(
    (p) => p.status === 'APPROVED' || p.status === 'EXITED'
  );

  // Recent pending request
  const activePendingPass = studentPasses.find((p) => p.status === 'PENDING');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !destination.trim()) {
      alert('Please fill out the reason for leaving and destination.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createGatePass({
        studentId: currentUser?.id || 'user-student-1',
        studentName,
        rollNumber,
        department,
        semester,
        reason,
        destination,
        type,
        leavingDate,
        leavingTime,
        expectedReturnTime,
        optionalNote,
        supportingDocument: supportingDocName,
      });

      setLastSubmittedId(created.passId);

      // Notification
      addNotification({
        userId: currentUser?.id || 'all',
        title: 'Gate Pass Submitted',
        message: `Your request (${created.passId}) is currently pending warden/faculty approval.`,
        type: 'hostel',
      });

      // Reset form
      setReason('');
      setDestination('');
      setOptionalNote('');
      setSupportingDocName('');
    } catch (err) {
      console.error('Failed to submit gate pass:', err);
      alert('Submission failed. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: GatePass['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>PENDING</span>
          </span>
        );
      case 'EXITED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span>OUTSIDE CAMPUS</span>
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>RETURNED</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>OVERDUE</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Smart Digital Gate Pass</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Bi-directional QR Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit out-pass leave requests, access approved dynamic QR passes, and record gate movement
          </p>
        </div>

        {activeApprovedPass && (
          <button
            onClick={() => setSelectedPass(activeApprovedPass)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition self-start sm:self-auto"
          >
            <QrCode className="w-4 h-4" />
            <span>View Approved Gate Pass ({activeApprovedPass.passId})</span>
          </button>
        )}
      </div>

      {/* Active Pass Banner (If student has an approved/outside pass) */}
      {activeApprovedPass && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Active Digital Gate Pass
              </span>
              <span className="font-mono text-xs font-bold text-slate-300">
                {activeApprovedPass.passId}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Destination: {activeApprovedPass.destination} ({activeApprovedPass.type})
            </h3>
            <p className="text-xs text-emerald-100">
              Reason: {activeApprovedPass.reason} &bull; Expected Return: <strong>{activeApprovedPass.expectedReturnTime}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedPass(activeApprovedPass)}
              className="px-4 py-2.5 bg-white text-emerald-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-50 flex items-center space-x-2 transition"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Show Gate Pass QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending Notice Banner (After submission or existing pending) */}
      {(lastSubmittedId || activePendingPass) && !activeApprovedPass && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-3 shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-900">🟡 Request Pending Approval</h4>
            <p className="mt-0.5 text-amber-800 font-medium">
              Your gate pass request ({lastSubmittedId || activePendingPass?.passId}) has been submitted and is currently waiting for Faculty or Hostel Warden review.
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              Once approved, your digital pass and entrance QR code will activate automatically.
            </p>
          </div>
        </div>
      )}

      {/* Grid: 1. Create Form (Col 5), 2. My History (Col 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CREATE GATE PASS FORM (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DoorOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Request New Gate Pass</h3>
              <p className="text-[11px] text-slate-500">Submit leave details for authority authorization</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Auto-filled Student Details */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Student</span>
                <span className="font-bold text-slate-900">{studentName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Roll Number</span>
                <span className="font-mono font-bold text-blue-700">{rollNumber}</span>
              </div>
            </div>

            {/* Department & Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Pass Type (Normal vs Emergency) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                Pass Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('Normal')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    type === 'Normal'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Normal Leave
                </button>
                <button
                  type="button"
                  onClick={() => setType('Emergency')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    type === 'Emergency'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Emergency Pass
                </button>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Destination Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Bolangir, City Health Clinic, Home"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  required
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Reason for Leaving */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Reason for Leaving
              </label>
              <textarea
                rows={2}
                placeholder="State the purpose of your exit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden resize-none"
                required
              />
              <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                {['Medical appointment', 'Family visit', 'Exam centre', 'Bookstore purchase'].map(
                  (sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => setReason(sug)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      {sug}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Leaving Date & Time */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Leaving Date
                </label>
                <input
                  type="date"
                  value={leavingDate}
                  onChange={(e) => setLeavingDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Leaving Time
                </label>
                <input
                  type="text"
                  placeholder="02:00 PM"
                  value={leavingTime}
                  onChange={(e) => setLeavingTime(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Return Time
                </label>
                <input
                  type="text"
                  placeholder="06:00 PM"
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden text-[11px]"
                  required
                />
              </div>
            </div>

            {/* Optional Note & Supporting Document */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Optional Note / Document
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Additional note for warden..."
                  value={optionalNote}
                  onChange={(e) => setOptionalNote(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
                />

                <label className="cursor-pointer flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-[11px] text-slate-600 transition">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{supportingDocName ? supportingDocName : 'Attach supporting document (optional)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSupportingDocName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'SUBMITTING...' : '[ SUBMIT GATE PASS REQUEST ]'}</span>
            </button>
          </form>
        </div>

        {/* MY GATE PASS HISTORY (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">My Gate Pass History</h3>
              <p className="text-[11px] text-slate-500">Record of authorized leaves, QR status, and gate return logs</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {studentPasses.length} total passes
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Exit</th>
                  <th className="py-2.5 px-3">Return</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentPasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No gate pass requests found. Submit a request on the left.
                    </td>
                  </tr>
                ) : (
                  studentPasses.map((p) => (
                    <tr key={p.passId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {p.leavingDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                          {p.reason}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                          To: {p.destination}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {p.exitTime || p.leavingTime}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {p.entryTime || p.expectedReturnTime}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(p.status)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {p.status === 'APPROVED' || p.status === 'EXITED' || p.status === 'RETURNED' ? (
                          <button
                            onClick={() => setSelectedPass(p)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center space-x-1 ml-auto"
                          >
                            <QrCode className="w-3 h-3 text-emerald-600" />
                            <span>View Pass</span>
                          </button>
                        ) : p.status === 'REJECTED' ? (
                          <span
                            className="text-[10px] text-rose-600 font-semibold cursor-help"
                            title={p.rejectionReason}
                          >
                            Reason: {p.rejectionReason?.slice(0, 20)}...
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">
                            In Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Notice footer */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/60 text-[11px] text-blue-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Security guards verify exit and campus return using the same dynamic QR code. Please ensure your return is recorded before the expected return time to avoid overdue flags.
            </p>
          </div>
        </div>
      </div>

      {/* Digital Gate Pass Modal */}
      {selectedPass && (
        <DigitalGatePassModal
          pass={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}
    </div>
  );
};
