import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { GatePass, GatePassQrPayload } from '../../types';
import {
  X,
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  Building,
  User,
  DoorOpen,
} from 'lucide-react';

interface DigitalGatePassModalProps {
  pass: GatePass;
  onClose: () => void;
}

export const DigitalGatePassModal: React.FC<DigitalGatePassModalProps> = ({ pass, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!pass.qrToken) return;

    // Minimal secure payload without personal PII
    const payload: GatePassQrPayload = {
      passId: pass.passId,
      qrToken: pass.qrToken,
      type: 'GATE_PASS',
    };

    QRCode.toDataURL(
      JSON.stringify(payload),
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [pass.passId, pass.qrToken]);

  const getStatusBadge = () => {
    switch (pass.status) {
      case 'APPROVED':
        return {
          label: 'APPROVED ✅',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'EXITED':
        return {
          label: 'CURRENTLY OUTSIDE 🔵',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'RETURNED':
        return {
          label: 'COMPLETED & RETURNED ✅',
          bg: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      case 'OVERDUE':
        return {
          label: 'OVERDUE 🔴',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'REJECTED':
        return {
          label: 'REJECTED ❌',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      default:
        return {
          label: 'PENDING 🟡',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[94vh]">
        {/* Pass Top Branding Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <DoorOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block">
                CAMPUS MADE EASY
              </span>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                SMART DIGITAL GATE PASS
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Status and Pass ID Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Pass ID
              </span>
              <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900">
                {pass.passId}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          {/* Student Bio Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Student Name:</span>
              <strong className="text-slate-900 font-bold">{pass.studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Roll Number:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {pass.rollNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="text-slate-700 font-semibold">{pass.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Pass Type:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                  pass.type === 'Emergency' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {pass.type}
              </span>
            </div>
          </div>

          {/* Journey & Reason Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Reason for Leaving</span>
              <p className="text-slate-800 font-semibold mt-0.5">{pass.reason}</p>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Destination</span>
                <span className="text-slate-900 font-bold flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{pass.destination}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Departure Date</span>
                <span className="text-slate-700 font-medium">{pass.leavingDate}</span>
              </div>
            </div>
          </div>

          {/* Time Windows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Leaving Time</span>
              <span className="font-extrabold text-sm text-emerald-950 flex items-center space-x-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{pass.leavingTime}</span>
              </span>
              {pass.exitTime && (
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  Gate Exit: <strong>{pass.exitTime}</strong>
                </span>
              )}
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 text-xs">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Expected Return</span>
              <span className="font-extrabold text-sm text-amber-950 flex items-center space-x-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{pass.expectedReturnTime}</span>
              </span>
              {pass.entryTime && (
                <span className="text-[10px] text-teal-700 mt-1 block">
                  Gate Return: <strong>{pass.entryTime}</strong>
                </span>
              )}
            </div>
          </div>

          {/* QR Code Presentation Box */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 flex flex-col items-center justify-center space-y-3 shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Gate Pass QR"
                className="w-48 h-48 object-contain rounded-xl shadow-xs"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-xl text-slate-400 text-xs font-semibold">
                Generating QR...
              </div>
            )}

            <div className="text-center space-y-1">
              <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                Security Token: {pass.qrToken || 'PENDING'}
              </span>
              <p className="text-[11px] text-slate-500 max-w-xs pt-1">
                Present this QR code to the Security Guard at the Main Gate during exit & campus return
              </p>
            </div>
          </div>

          {/* Approval Sign-off footer */}
          {pass.approvedByName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
              <span>Approved By: <strong>{pass.approvedByName}</strong></span>
              <span className="text-slate-400">
                {pass.approvedAt ? new Date(pass.approvedAt).toLocaleDateString() : ''}
              </span>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Pass</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
