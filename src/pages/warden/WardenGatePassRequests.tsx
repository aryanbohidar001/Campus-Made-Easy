import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GatePass } from '../../types';
import {
  subscribeToAllGatePasses,
  approveGatePass,
  rejectGatePass,
} from '../../services/gatePassService';
import { DigitalGatePassModal } from '../../components/gatepass/DigitalGatePassModal';
import {
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Filter,
  Search,
  User,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet,
  QrCode,
  Info,
} from 'lucide-react';

export const WardenGatePassRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useData();

  const [passes, setPasses] = useState<GatePass[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'outside' | 'history'>('pending');

  // Rejection Modal State
  const [rejectingPass, setRejectingPass] = useState<GatePass | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Digital Pass View Modal
  const [viewingPass, setViewingPass] = useState<GatePass | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Subscribe to live passes
  useEffect(() => {
    const unsub = subscribeToAllGatePasses((list) => {
      setPasses(list);
    });
    return () => unsub();
  }, []);

  // Filter lists
  const pendingPasses = passes.filter((p) => p.status === 'PENDING');
  const outsidePasses = passes.filter((p) => p.status === 'EXITED' || p.status === 'OVERDUE');
  const overduePasses = passes.filter((p) => p.status === 'OVERDUE');

  // Handle Approve
  const handleApprove = async (pass: GatePass) => {
    setIsProcessing(true);
    try {
      const approverName = currentUser?.name || 'Prof. Faculty / Warden';
      const approverId = currentUser?.id || 'warden-1';

      await approveGatePass({
        passId: pass.passId,
        approverId,
        approverName,
      });

      // Send in-app notification to student
      addNotification({
        userId: pass.studentId,
        title: '✅ Gate Pass Approved',
        message: `Your gate pass has been approved. Pass ID: ${pass.passId}`,
        type: 'hostel',
      });
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Could not approve pass. Please check connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPass) return;
    if (!rejectionReasonInput.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setIsProcessing(true);
    try {
      const approverName = currentUser?.name || 'Prof. Faculty / Warden';
      const approverId = currentUser?.id || 'warden-1';

      await rejectGatePass({
        passId: rejectingPass.passId,
        approverId,
        approverName,
        reason: rejectionReasonInput.trim(),
      });

      // Send in-app notification to student
      addNotification({
        userId: rejectingPass.studentId,
        title: '❌ Gate Pass Rejected',
        message: `Your gate pass has been rejected. Reason: ${rejectionReasonInput.trim()}`,
        type: 'hostel',
      });

      setRejectingPass(null);
      setRejectionReasonInput('');
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Could not reject pass.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered list for History
  const filteredHistory = passes.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.passId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'All' || p.department.includes(deptFilter);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Smart Gate Pass Oversight</h2>
            {overduePasses.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                ⚠️ {overduePasses.length} Overdue Students
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review out-pass requests, generate cryptographic pass tokens, and monitor real-time campus exits
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Requests ({pendingPasses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('outside')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'outside'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Outside Campus ({outsidePasses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>All Records</span>
          </button>
        </div>
      </div>

      {/* OVERDUE NOTICE BANNER (Section 10) */}
      {overduePasses.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900">
                ⚠️ OVERDUE GATE PASS ALERT
              </h4>
              <p className="text-xs text-rose-800 font-medium mt-0.5">
                {overduePasses.length} student{overduePasses.length > 1 ? 's have' : ' has'} exceeded their expected return time without recorded entry at the Main Gate.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('outside')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap"
          >
            View Overdue List
          </button>
        </div>
      )}

      {/* TAB 1: PENDING REQUESTS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Gate Pass Authorization Queue
            </h3>
            <span className="text-xs text-slate-500">
              {pendingPasses.length} requests requiring decision
            </span>
          </div>

          {pendingPasses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900">All Caught Up!</h4>
              <p className="text-xs text-slate-500">No pending student gate pass requests at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPasses.map((pass) => (
                <div
                  key={pass.passId}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md">
                        {pass.passId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pass.type === 'Emergency'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {pass.type} Leave
                      </span>
                    </div>

                    {/* Student Info Card */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold text-sm text-slate-900">{pass.studentName}</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Roll No: <strong className="text-slate-800 font-mono">{pass.rollNumber}</strong> &bull; {pass.department} ({pass.semester} Sem)
                      </p>
                    </div>

                    {/* Details Box */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Reason:</span>
                        <p className="text-slate-800 font-semibold">{pass.reason}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination:</span>
                        <p className="text-slate-800 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span>{pass.destination}</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span>Leaving: <strong>{pass.leavingTime}</strong></span>
                        <span>Expected Return: <strong className="text-amber-700">{pass.expectedReturnTime}</strong></span>
                      </div>
                    </div>

                    {pass.optionalNote && (
                      <p className="text-[11px] text-slate-500 italic">
                        Note: &ldquo;{pass.optionalNote}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Approve / Reject Buttons (Prompt Section 3) */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(pass)}
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>[ APPROVE ]</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectingPass(pass);
                        setRejectionReasonInput('Insufficient information or unauthorized timing.');
                      }}
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>[ REJECT ]</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENTS CURRENTLY OUTSIDE CAMPUS (Section 11) */}
      {activeTab === 'outside' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <DoorOpen className="w-4 h-4 text-blue-600" />
                <span>🚨 Students Currently Outside Campus</span>
              </h3>
              <p className="text-[11px] text-slate-500">Live roster of authorized students checked out at the Main Gate</p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
                🟢 Outside: {outsidePasses.filter((p) => p.status === 'EXITED').length}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200">
                🔴 OVERDUE: {overduePasses.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Exit Recorded</th>
                  <th className="py-3 px-4">Expected Return</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outsidePasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      All authorized students are currently inside campus.
                    </td>
                  </tr>
                ) : (
                  outsidePasses.map((p) => {
                    const isOverdue = p.status === 'OVERDUE';
                    return (
                      <tr
                        key={p.passId}
                        className={`transition ${isOverdue ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {p.studentName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {p.rollNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {p.destination}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {p.exitTime || p.leavingTime}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {p.expectedReturnTime}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOverdue ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              <span>🔴 OVERDUE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <span>🟢 Outside</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setViewingPass(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center space-x-1 ml-auto"
                          >
                            <QrCode className="w-3 h-3 text-slate-500" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">University Gate Pass Records</h3>
              <p className="text-[11px] text-slate-500">Historical archive of all digital passes and gate movements</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student or pass ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="EXITED">Exited</option>
                <option value="RETURNED">Returned</option>
                <option value="OVERDUE">Overdue</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Pass ID</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Exit</th>
                  <th className="py-2.5 px-3">Return</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((p) => (
                  <tr key={p.passId} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {p.passId}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{p.studentName}</span>
                      <span className="text-[10px] text-slate-500">{p.rollNumber}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{p.destination}</td>
                    <td className="py-3 px-3 text-slate-600">{p.leavingDate}</td>
                    <td className="py-3 px-3 text-slate-600">{p.exitTime || p.leavingTime}</td>
                    <td className="py-3 px-3 text-slate-600">{p.entryTime || p.expectedReturnTime}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'RETURNED'
                            ? 'bg-teal-100 text-teal-800'
                            : p.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setViewingPass(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] ml-auto"
                      >
                        Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL (Section 3 Requirement) */}
      {rejectingPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Decline Gate Pass</h3>
            </div>
            <p className="text-xs text-slate-500">
              Provide a valid reason for declining <strong>{rejectingPass.studentName}&apos;s</strong> request ({rejectingPass.passId}).
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Rejection Reason (will be notified to student)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Insufficient information, unapproved hour, missing guardian consent..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectingPass(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Pass Presentation Modal */}
      {viewingPass && (
        <DigitalGatePassModal
          pass={viewingPass}
          onClose={() => setViewingPass(null)}
        />
      )}
    </div>
  );
};
