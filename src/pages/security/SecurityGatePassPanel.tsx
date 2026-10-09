import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GatePass, GatePassQrPayload } from '../../types';
import {
  subscribeToAllGatePasses,
  verifyGatePassByScan,
  recordStudentExit,
  recordStudentReturn,
  GatePassVerificationResult,
} from '../../services/gatePassService';
import {
  Shield,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  ArrowRight,
  RefreshCw,
  DoorOpen,
  Maximize2,
  Upload,
  FileText,
  Sparkles,
} from 'lucide-react';

export const SecurityGatePassPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useData();

  const [passes, setPasses] = useState<GatePass[]>([]);

  // Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scan Verification State
  const [verificationResult, setVerificationResult] = useState<GatePassVerificationResult | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<{
    type: 'EXIT' | 'RETURN';
    time: string;
    expectedReturnTime?: string;
  } | null>(null);

  // Manual token input fallback
  const [manualPassId, setManualPassId] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Video refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Subscribe to live passes
  useEffect(() => {
    const unsub = subscribeToAllGatePasses((list) => {
      setPasses(list);
    });
    return () => unsub();
  }, []);

  const stopCameraStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Handle scanned payload
  const handleVerifyPayload = useCallback(
    async (payload: { passId: string; qrToken: string }) => {
      stopCameraStream();
      setActionSuccessNotice(null);

      const result = await verifyGatePassByScan(payload.passId, payload.qrToken);
      setVerificationResult(result);
    },
    [stopCameraStream]
  );

  // Camera Frame Loop
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          try {
            let parsed: any = null;
            if (code.data.startsWith('{')) {
              parsed = JSON.parse(code.data);
            }
            if (parsed && parsed.passId && parsed.qrToken) {
              handleVerifyPayload({ passId: parsed.passId, qrToken: parsed.qrToken });
              return;
            }
          } catch (e) {
            console.warn('QR parse err:', e);
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [handleVerifyPayload]);

  // Start Camera
  const handleStartCamera = async () => {
    setCameraError(null);
    setVerificationResult(null);
    setActionSuccessNotice(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported on this browser.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      setIsCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or camera device unavailable.');
    }
  };

  // Image photo upload fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            try {
              const parsed = JSON.parse(code.data);
              if (parsed.passId && parsed.qrToken) {
                handleVerifyPayload({ passId: parsed.passId, qrToken: parsed.qrToken });
                return;
              }
            } catch {
              // format error
            }
          }
          alert('No valid gate pass QR found in selected image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // ACTION: CONFIRM EXIT (Section 8)
  // ----------------------------------------------------
  const handleConfirmExit = async () => {
    if (!verificationResult?.pass) return;
    setIsProcessingAction(true);

    try {
      const guardId = currentUser?.id || 'user-security-1';
      const updated = await recordStudentExit({
        passId: verificationResult.pass.passId,
        securityGuardId: guardId,
      });

      setActionSuccessNotice({
        type: 'EXIT',
        time: updated.exitTime || 'Just now',
        expectedReturnTime: updated.expectedReturnTime,
      });

      // Clear current card
      setVerificationResult(null);

      // In-app alert
      addNotification({
        userId: updated.studentId,
        title: 'Gate Exit Recorded',
        message: `Your campus exit was logged at ${updated.exitTime}. Return expected by ${updated.expectedReturnTime}.`,
        type: 'hostel',
      });
    } catch (err) {
      console.error('Exit recording failed:', err);
      alert('Could not record exit.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: CONFIRM RETURN (Section 9)
  // ----------------------------------------------------
  const handleConfirmReturn = async () => {
    if (!verificationResult?.pass) return;
    setIsProcessingAction(true);

    try {
      const guardId = currentUser?.id || 'user-security-1';
      const updated = await recordStudentReturn({
        passId: verificationResult.pass.passId,
        securityGuardId: guardId,
      });

      setActionSuccessNotice({
        type: 'RETURN',
        time: updated.entryTime || 'Just now',
      });

      setVerificationResult(null);

      // In-app alert
      addNotification({
        userId: updated.studentId,
        title: 'Campus Return Recorded',
        message: `Your return to campus was confirmed at ${updated.entryTime}. Pass completed.`,
        type: 'hostel',
      });
    } catch (err) {
      console.error('Return recording failed:', err);
      alert('Could not record return.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Recent gate activity records
  const recentMovementLogs = passes.filter(
    (p) => p.status === 'EXITED' || p.status === 'RETURNED' || p.status === 'OVERDUE'
  );

  return (
    <div className="space-y-6">
      {/* Security Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/30 text-teal-200 border border-teal-400/30">
                Main Gate Post #1
              </span>
              <span className="text-xs text-slate-300 font-mono">Duty: Officer Balwant Singh</span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              🛡️ Gate Security Panel
            </h2>
            <p className="text-xs text-slate-300">
              Verify digital QR gate passes &bull; Record authorized exits & campus returns
            </p>
          </div>
        </div>

        <button
          onClick={handleStartCamera}
          className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-500/25 flex items-center space-x-2 transition self-start sm:self-auto cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>[ SCAN GATE PASS ]</span>
        </button>
      </div>

      {/* SUCCESS CONFIRMATION BANNERS */}
      {actionSuccessNotice && actionSuccessNotice.type === 'EXIT' && (
        <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-1 shadow-md animate-in fade-in">
          <div className="flex items-center space-x-2 text-emerald-800 font-black text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>✅ EXIT RECORDED</span>
          </div>
          <p className="text-xs text-emerald-900 font-medium">
            Exit Time: <strong>{actionSuccessNotice.time}</strong> &bull; Expected Return: <strong>{actionSuccessNotice.expectedReturnTime}</strong>
          </p>
          <p className="text-[11px] text-emerald-700">
            Student gate departure saved to Cloud Firestore. Status updated to <strong>EXITED</strong>.
          </p>
        </div>
      )}

      {actionSuccessNotice && actionSuccessNotice.type === 'RETURN' && (
        <div className="p-5 rounded-3xl bg-teal-50 border-2 border-teal-300 text-teal-950 space-y-1 shadow-md animate-in fade-in">
          <div className="flex items-center space-x-2 text-teal-800 font-black text-base">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>✅ RETURN RECORDED</span>
          </div>
          <p className="text-xs text-teal-900 font-medium">
            Entry Time: <strong>{actionSuccessNotice.time}</strong>
          </p>
          <p className="text-[11px] text-teal-700">
            Student return confirmed and closed in Cloud Firestore. Status updated to <strong>RETURNED</strong>.
          </p>
        </div>
      )}

      {/* CAMERA SCANNER VIEWPORT */}
      {isCameraActive && (
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-teal-400 relative aspect-video max-h-[380px] flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Crosshair Scanner Frame */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-60 h-60 border-2 border-teal-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg -mb-1 -mr-1" />
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_8px_#2dd4bf] animate-[bounce_2s_infinite]" />
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={stopCameraStream}
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 transition"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Scanner</span>
            </button>
          </div>

          <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
            <span className="px-3.5 py-1 rounded-full bg-slate-950/80 text-teal-300 text-xs font-semibold backdrop-blur-md">
              Point camera at student&apos;s digital gate pass QR code
            </span>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Camera scanner notice:</span> {cameraError}
            <p className="mt-1">Use the quick simulation buttons or image photo upload below.</p>
          </div>
        </div>
      )}

      {/* VERIFICATION RESULT PANEL (Prompt Sections 7, 8, 9) */}
      {verificationResult && (
        <div className="animate-in fade-in space-y-4">
          {verificationResult.isValid && verificationResult.pass ? (
            <div className="bg-white rounded-3xl border-2 border-teal-500 shadow-xl overflow-hidden">
              {/* Header */}
              <div
                className={`p-5 text-white flex items-center justify-between ${
                  verificationResult.statusType === 'APPROVED'
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
                    : 'bg-gradient-to-r from-blue-900 to-indigo-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold text-lg">
                    {verificationResult.statusType === 'APPROVED' ? '🟢' : '🔄'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white">
                      {verificationResult.statusType === 'APPROVED'
                        ? 'GATE PASS VERIFIED'
                        : 'STUDENT RETURN VERIFICATION'}
                    </h3>
                    <p className="text-xs text-teal-100">
                      Pass ID: <strong className="font-mono">{verificationResult.pass.passId}</strong>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30">
                  {verificationResult.statusType === 'APPROVED' ? 'READY FOR EXIT' : 'RETURNING TO CAMPUS'}
                </span>
              </div>

              {/* Student Pass Bio */}
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Student</span>
                    <strong className="text-slate-900 text-sm">{verificationResult.pass.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Roll No</span>
                    <strong className="text-blue-700 font-mono text-sm">{verificationResult.pass.rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Reason</span>
                    <span className="text-slate-800 font-semibold">{verificationResult.pass.reason}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Destination</span>
                    <span className="text-slate-800 font-semibold">{verificationResult.pass.destination}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Leaving</span>
                    <span className="font-bold text-slate-800">
                      {verificationResult.pass.exitTime || verificationResult.pass.leavingTime}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-700 uppercase font-bold block">Expected Return</span>
                    <span className="font-bold text-amber-950 text-sm">
                      {verificationResult.pass.expectedReturnTime}
                    </span>
                  </div>
                </div>

                {/* Primary Confirmation Action Button */}
                <div className="pt-2">
                  {verificationResult.statusType === 'APPROVED' ? (
                    <button
                      onClick={handleConfirmExit}
                      disabled={isProcessingAction}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <DoorOpen className="w-5 h-5" />
                      <span>{isProcessingAction ? 'RECORDING EXIT...' : '[ CONFIRM EXIT ]'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmReturn}
                      disabled={isProcessingAction}
                      className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{isProcessingAction ? 'RECORDING RETURN...' : '[ CONFIRM RETURN ]'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* INVALID PASS WARNING */
            <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 shadow-md">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
                <XCircle className="w-6 h-6" />
                <span>INVALID OR REJECTED GATE PASS</span>
              </div>
              <p className="text-xs text-rose-800">{verificationResult.message}</p>
              <button
                onClick={() => setVerificationResult(null)}
                className="mt-2 px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-700"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUICK TESTING SCANNER CONTROLS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Security Gate Quick Scan Shortcuts</h3>
            <p className="text-[11px] text-slate-500">Scan active student passes or test camera fallbacks</p>
          </div>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            {showManualInput ? 'Hide Manual Code' : 'Enter Pass Token'}
          </button>
        </div>

        {/* Quick Demo Simulator Buttons for passes */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">
            Active Student Passes Available for Gate Scan:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {passes
              .filter((p) => p.status === 'APPROVED' || p.status === 'EXITED' || p.status === 'OVERDUE')
              .map((p) => (
                <div
                  key={p.passId}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-teal-300 transition"
                >
                  <div>
                    <span className="font-mono font-bold text-[11px] text-slate-700">{p.passId}</span>
                    <strong className="text-slate-900 block font-semibold">{p.studentName}</strong>
                    <span className="text-[10px] text-slate-500">Status: {p.status} &bull; To: {p.destination}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (p.qrToken) {
                        handleVerifyPayload({ passId: p.passId, qrToken: p.qrToken });
                      }
                    }}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-[11px] transition shadow-xs flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{p.status === 'APPROVED' ? 'Scan for Exit' : 'Scan Return'}</span>
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Manual Pass ID & Token Input Dropdown */}
        {showManualInput && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase">Manual Gate Pass Lookup</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Pass ID (e.g. GP-20261009-001)"
                value={manualPassId}
                onChange={(e) => setManualPassId(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl font-mono bg-white"
              />
              <input
                type="text"
                placeholder="QR Token (e.g. X7K92P8Q)"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl font-mono bg-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (manualPassId.trim() && manualToken.trim()) {
                    handleVerifyPayload({ passId: manualPassId.trim(), qrToken: manualToken.trim() });
                  }
                }}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Verify Pass Token
              </button>
            </div>
          </div>
        )}

        {/* Upload QR Photo option */}
        <label className="cursor-pointer flex items-center justify-center space-x-1.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition">
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span>Upload Student Gate Pass QR Image / Photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* RECENT MOVEMENT REGISTER LOGS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Today&apos;s Gate Exit & Return Log</h3>
            <p className="text-[11px] text-slate-500">Real-time gatekeeper ledger verified by Security Guard</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{recentMovementLogs.length} verified movements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Pass ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Gate Exit</th>
                <th className="py-2.5 px-3">Gate Return</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMovementLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    No exits or returns logged yet today.
                  </td>
                </tr>
              ) : (
                recentMovementLogs.map((p) => (
                  <tr key={p.passId} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{p.passId}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{p.studentName}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-blue-700">{p.rollNumber}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{p.exitTime || '—'}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{p.entryTime || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'RETURNED'
                            ? 'bg-teal-100 text-teal-800'
                            : p.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
