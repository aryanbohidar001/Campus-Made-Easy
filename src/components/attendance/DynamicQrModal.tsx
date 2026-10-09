import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  AttendanceSession,
  AttendanceQrPayload,
} from '../../types';
import {
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  AlertTriangle,
  Radio,
  MapPin,
  Users,
} from 'lucide-react';

interface DynamicQrModalProps {
  session: AttendanceSession;
  presentCount: number;
  totalStudents: number;
  onRefreshQr: (durationMinutes: number) => Promise<void>;
  onCloseSession: () => Promise<void>;
  onCloseModal: () => void;
  allowedRadius: number;
}

export const DynamicQrModal: React.FC<DynamicQrModalProps> = ({
  session,
  presentCount,
  totalStudents,
  onRefreshQr,
  onCloseSession,
  onCloseModal,
  allowedRadius,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [selectedExtendMinutes, setSelectedExtendMinutes] = useState<number>(5);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate QR Code data URL whenever session or qrToken changes
  useEffect(() => {
    const payload: AttendanceQrPayload = {
      sessionId: session.sessionId,
      subject: session.subjectName,
      date: session.date,
      expiresAt: new Date(session.expiresAtTimestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      randomToken: session.qrToken,
    };

    const qrString = JSON.stringify(payload);

    QRCode.toDataURL(
      qrString,
      {
        width: 360,
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
  }, [session.sessionId, session.qrToken, session.expiresAtTimestamp]);

  // Expiration countdown ticker
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const remainingMs = session.expiresAtTimestamp - now;

      if (remainingMs <= 0 || session.status === 'EXPIRED' || session.status === 'CLOSED') {
        setTimeLeftSeconds(0);
        setIsExpired(true);
      } else {
        setTimeLeftSeconds(Math.ceil(remainingMs / 1000));
        setIsExpired(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAtTimestamp, session.status]);

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyPayload = () => {
    const payload = JSON.stringify({
      sessionId: session.sessionId,
      subject: session.subjectName,
      date: session.date,
      expiresAt: session.expiresAt,
      randomToken: session.qrToken,
    });
    navigator.clipboard?.writeText(payload);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshQr(selectedExtendMinutes);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Warning threshold
  const isExpiringSoon = timeLeftSeconds > 0 && timeLeftSeconds <= 60;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-all ${
        isFullscreen ? 'p-0 bg-slate-950' : ''
      }`}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden w-full transition-all ${
          isFullscreen
            ? 'h-full max-w-none rounded-none'
            : 'max-w-2xl max-h-[92vh]'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {session.subjectName}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {session.sessionId}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                <span>{session.branch} • {session.semester} • {session.section}</span>
                <span>•</span>
                <span>Period: {session.classPeriod.split(' ')[1] || session.classPeriod}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Lecture Projector Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onCloseModal}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col items-center justify-center space-y-6">
          {/* Status & Timer Badges */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
            <div className="flex items-center space-x-3">
              {isExpired ? (
                <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span>QR EXPIRED</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>QR ACTIVE</span>
                </div>
              )}

              <div
                className={`flex items-center space-x-2 font-mono font-bold text-sm sm:text-base px-3 py-1 rounded-xl border transition ${
                  isExpired
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : isExpiringSoon
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-900 text-white border-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {isExpired ? 'EXPIRED' : `Expires in ${formatCountdown(timeLeftSeconds)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span>
                  Present: <strong className="text-emerald-600 font-bold">{presentCount}</strong> / {totalStudents}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-500 font-medium hidden sm:flex">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Geofence: &le; {allowedRadius}m</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative group">
            <div
              className={`p-4 sm:p-6 bg-white rounded-3xl border-2 transition-all shadow-xl flex flex-col items-center justify-center ${
                isExpired
                  ? 'border-rose-300 opacity-40 grayscale'
                  : isExpiringSoon
                  ? 'border-amber-400 ring-4 ring-amber-100'
                  : 'border-emerald-500/50 ring-4 ring-emerald-50'
              }`}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Attendance Session QR"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-slate-100 rounded-xl">
                  <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              )}

              {/* Token & Subject Footer */}
              <div className="mt-3 flex items-center space-x-2 text-xs font-mono text-slate-600">
                <span className="font-semibold text-slate-400">Token:</span>
                <span className="font-bold text-slate-900 tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {session.qrToken}
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="text-slate-400 hover:text-slate-800 transition p-1"
                  title="Copy QR Payload"
                >
                  {copiedToken ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Expired Overlay */}
            {isExpired && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs rounded-3xl text-white p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-white">QR Code Expired</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">
                  Students can no longer mark attendance with this QR. Generate a new QR code to resume attendance.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Generate New QR</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security & Verification Banner */}
          <div className="w-full bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">Dynamic Security Safeguards Active</p>
              <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                Attendance requires dual verification: device GPS must be within <strong>{allowedRadius}m</strong> of college grounds, and the dynamic token updates per session. Screenshots or forwarded codes are rejected once expired.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Reset duration:</span>
            <select
              value={selectedExtendMinutes}
              onChange={(e) => setSelectedExtendMinutes(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value={2}>2 Minutes</option>
              <option value={5}>5 Minutes (Default)</option>
              <option value={10}>10 Minutes</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Generating...' : 'Generate New QR'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to close this attendance session? Students will no longer be able to scan.')) {
                  await onCloseSession();
                  onCloseModal();
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              Close Attendance Session
            </button>
            <button
              onClick={onCloseModal}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              View Attendance Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
