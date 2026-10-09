import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Check,
  X,
} from 'lucide-react';

export const TeacherRequests: React.FC = () => {
  const { hostelRequests, updateHostelRequestStatus } = useData();

  const handleApprove = (id: string) => {
    updateHostelRequestStatus(id, 'Approved', 'Academic advisor approved leave pass.');
  };

  const handleReject = (id: string) => {
    updateHostelRequestStatus(id, 'Rejected', 'Attendance criteria not met for extended leave.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Student Academic & Leave Requests</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review leave of absence, hackathon participation NOCs, and academic concession petitions
        </p>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {hostelRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No pending student applications at this time.
          </div>
        ) : (
          hostelRequests.map((req) => (
            <div key={req.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{req.studentName} ({req.rollNumber})</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {req.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{req.details}</p>
                <p className="text-[11px] text-slate-400">Date: {req.requestDate}</p>
              </div>

              {req.status === 'Pending' && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
