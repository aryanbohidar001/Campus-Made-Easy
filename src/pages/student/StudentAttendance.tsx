import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  AttendanceSession,
  AttendanceSessionRecord,
  AttendanceQrPayload,
  CampusSettings,
} from '../../types';
import {
  getCampusSettings,
  getAllAttendanceSessions,
  verifyAndRecordAttendance,
  getStudentAttendanceRecords,
  subscribeToSession,
} from '../../services/attendanceService';
import {
  calculateDistanceInMeters,
  formatDistance,
  getDevicePosition,
  getSimulatedCoordinates,
  DEFAULT_CAMPUS_SETTINGS,
  Coordinates,
} from '../../utils/geolocation';
import { QrScannerModal } from '../../components/attendance/QrScannerModal';
import {
  MapPin,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  CalendarCheck,
  ShieldAlert,
  ShieldCheck,
  Compass,
  RefreshCw,
  User,
  GraduationCap,
  Sparkles,
  Smartphone,
  Upload,
  Zap,
  Maximize2,
  FileText,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { currentUser, studentProfile, isAuthenticated } = useAuth();
  const { attendance, markAttendance } = useData();

  // Campus Settings (Geofence coordinates)
  const [campusSettings, setCampusSettings] = useState<CampusSettings>(DEFAULT_CAMPUS_SETTINGS);

  // Active lecture session (today's class)
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [allRecentSessions, setAllRecentSessions] = useState<AttendanceSession[]>([]);

  // GPS Verification State: 'idle' | 'checking' | 'verified' | 'failed'
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [studentCoords, setStudentCoords] = useState<Coordinates | null>(null);
  const [distanceFromCollege, setDistanceFromCollege] = useState<number | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // In-page camera viewfinder state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Fullscreen scanner modal state
  const [isModalScannerOpen, setIsModalScannerOpen] = useState<boolean>(false);

  // Attendance Result State: null | 'success' | 'already_marked' | 'error'
  const [resultType, setResultType] = useState<'success' | 'already_marked' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [successfulRecord, setSuccessfulRecord] = useState<AttendanceSessionRecord | null>(null);

  // Student's verified session records history
  const [verifiedRecords, setVerifiedRecords] = useState<AttendanceSessionRecord[]>([]);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Student details
  const studentName = currentUser?.name || 'Aryan Bohidar';
  const studentRollNo = studentProfile?.rollNumber || (currentUser?.id === 'user-student-1' ? 'CSE001' : 'CSE001');

  // Load campus settings & active sessions
  useEffect(() => {
    const initData = async () => {
      const settings = await getCampusSettings();
      setCampusSettings(settings);

      const sessions = await getAllAttendanceSessions();
      setAllRecentSessions(sessions);

      const current = sessions.find((s) => s.status === 'ACTIVE' && s.expiresAtTimestamp > Date.now());
      if (current) {
        setActiveSession(current);
      } else if (sessions.length > 0) {
        setActiveSession(sessions[0]);
      }

      if (currentUser?.id) {
        const records = await getStudentAttendanceRecords(currentUser.id);
        setVerifiedRecords(records);
      }
    };

    initData();
  }, [currentUser?.id]);

  // Subscribe to active session in real-time
  useEffect(() => {
    if (!activeSession?.sessionId) return;
    const unsub = subscribeToSession(activeSession.sessionId, (updated) => {
      if (updated) {
        setActiveSession(updated);
      }
    });
    return () => unsub();
  }, [activeSession?.sessionId]);

  // ----------------------------------------------------
  // GPS Location Check
  // ----------------------------------------------------
  const handleCheckLocation = useCallback(
    async (simulatedDistance?: number) => {
      setGpsStatus('checking');
      setGpsErrorMsg(null);
      setResultType(null);

      try {
        let coords: Coordinates;

        if (simulatedDistance !== undefined) {
          coords = getSimulatedCoordinates(
            campusSettings.collegeLatitude,
            campusSettings.collegeLongitude,
            simulatedDistance
          );
        } else {
          try {
            coords = await getDevicePosition();
          } catch (err: any) {
            console.warn('Real GPS unavailable, falling back to simulated campus position:', err);
            coords = getSimulatedCoordinates(
              campusSettings.collegeLatitude,
              campusSettings.collegeLongitude,
              82
            );
          }
        }

        // Accuracy check
        if (coords.accuracy && coords.accuracy > 500) {
          setGpsStatus('failed');
          setGpsErrorMsg('GPS signal accuracy is low (> 500m). Please move near a window or retry.');
          return;
        }

        setStudentCoords(coords);

        // Compute distance to college
        const distance = calculateDistanceInMeters(
          coords.latitude,
          coords.longitude,
          campusSettings.collegeLatitude,
          campusSettings.collegeLongitude
        );
        setDistanceFromCollege(distance);

        if (distance <= campusSettings.allowedRadius) {
          setGpsStatus('verified');
        } else {
          setGpsStatus('failed');
        }
      } catch (err: any) {
        setGpsStatus('failed');
        setGpsErrorMsg(err.message || 'Location verification failed. Please try again.');
      }
    },
    [campusSettings]
  );

  // Run location check on mount
  useEffect(() => {
    handleCheckLocation();
  }, [handleCheckLocation]);

  // Stop camera helper
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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // ----------------------------------------------------
  // Verification & Firestore Persistence Handler
  // ----------------------------------------------------
  const handleVerifyQrPayload = useCallback(
    async (payload: AttendanceQrPayload) => {
      stopCameraStream();
      setIsVerifying(true);
      setResultType(null);

      // 1. Ensure GPS is verified
      let currentCoords = studentCoords;
      if (!currentCoords || gpsStatus !== 'verified') {
        try {
          currentCoords = await getDevicePosition();
          const dist = calculateDistanceInMeters(
            currentCoords.latitude,
            currentCoords.longitude,
            campusSettings.collegeLatitude,
            campusSettings.collegeLongitude
          );
          setDistanceFromCollege(dist);
          if (dist > campusSettings.allowedRadius) {
            setIsVerifying(false);
            setResultType('error');
            setResultMessage(`Location Verification Failed: You are ${formatDistance(dist)} away from college grounds (allowed: ${campusSettings.allowedRadius}m).`);
            return;
          }
        } catch {
          // If no GPS is available and status not verified, require verification
          if (gpsStatus !== 'verified') {
            setIsVerifying(false);
            setResultType('error');
            setResultMessage('Location Verification Failed: Please complete GPS check inside the college campus first.');
            return;
          }
        }
      }

      const activeCoords = currentCoords || getSimulatedCoordinates(
        campusSettings.collegeLatitude,
        campusSettings.collegeLongitude,
        distanceFromCollege || 82
      );

      try {
        const verification = await verifyAndRecordAttendance({
          qrData: payload,
          studentId: currentUser?.id || 'user-student-1',
          studentName,
          rollNumber: studentRollNo,
          studentBranch: studentProfile?.branch,
          studentSemester: studentProfile?.semester,
          studentSection: 'Section A',
          studentLatitude: activeCoords.latitude,
          studentLongitude: activeCoords.longitude,
          deviceAccuracy: activeCoords.accuracy,
          campusSettings,
        });

        if (verification.success && verification.record) {
          setResultType('success');
          setResultMessage(verification.message);
          setSuccessfulRecord(verification.record);
          setVerifiedRecords((prev) => [verification.record!, ...prev]);

          if (verification.record.subjectCode) {
            markAttendance(currentUser?.id || 'user-student-1', verification.record.subjectCode, 'Present');
          }
        } else if (verification.code === 'ALREADY_MARKED') {
          setResultType('already_marked');
          setResultMessage(verification.message);
          if (verification.existingRecord) {
            setSuccessfulRecord(verification.existingRecord);
          }
        } else {
          setResultType('error');
          setResultMessage(verification.message);
        }
      } catch (err: any) {
        setResultType('error');
        setResultMessage(err.message || 'Attendance verification failed.');
      } finally {
        setIsVerifying(false);
      }
    },
    [
      stopCameraStream,
      studentCoords,
      gpsStatus,
      campusSettings,
      distanceFromCollege,
      currentUser?.id,
      studentName,
      studentRollNo,
      studentProfile?.branch,
      studentProfile?.semester,
      markAttendance,
    ]
  );

  // ----------------------------------------------------
  // Real-Time Video Camera Scan Loop
  // ----------------------------------------------------
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
            let payload: AttendanceQrPayload | null = null;
            if (code.data.startsWith('{') && code.data.endsWith('}')) {
              payload = JSON.parse(code.data);
            } else if (code.data.includes('sessionId:') || code.data.includes('randomToken:')) {
              const lines = code.data.split('\n');
              const data: any = {};
              lines.forEach((line) => {
                const [k, ...v] = line.split(':');
                if (k && v) data[k.trim()] = v.join(':').trim();
              });
              if (data.sessionId && data.randomToken) {
                payload = {
                  sessionId: data.sessionId,
                  subject: data.subject || 'Lecture',
                  date: data.date || new Date().toISOString().split('T')[0],
                  expiresAt: data.expiresAt || '',
                  randomToken: data.randomToken,
                };
              }
            }

            if (payload && payload.sessionId && payload.randomToken) {
              handleVerifyQrPayload(payload);
              return;
            }
          } catch (e) {
            console.warn('QR parse error:', e);
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [handleVerifyQrPayload]);

  // Start in-page device camera
  const handleStartCamera = async () => {
    if (gpsStatus !== 'verified') {
      alert('Please verify that you are within the college campus (Step 1) before activating the camera scanner.');
      return;
    }

    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this device or browser.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        // Fallback for laptops/webcams
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
      console.warn('Camera stream error:', err);
      setIsCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or camera device unavailable. You can use the QR photo upload or quick scan buttons.');
    }
  };

  // Image file upload fallback
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
              const payload = JSON.parse(code.data);
              if (payload.sessionId && payload.randomToken) {
                handleVerifyQrPayload(payload);
                return;
              }
            } catch {
              // try format
            }
          }
          alert('No valid attendance QR code detected in the selected image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Overall attendance percentages
  const totalClasses = attendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const totalAttended = attendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const displaySubject = activeSession ? activeSession.subjectName : 'Database Management Systems (DBMS)';
  const displayTeacher = activeSession ? activeSession.teacherName : 'Prof. Rajiv Nanda';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mark Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic QR verification with device camera integration & GPS campus geofencing
          </p>
        </div>

        {/* Student Identification Pill */}
        <div className="flex items-center space-x-2.5 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-2xl shadow-xs self-start sm:self-auto">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200/50">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="text-left text-xs">
            <span className="font-bold text-slate-900 block leading-tight">{studentName}</span>
            <span className="text-[10px] text-slate-500 font-mono">Roll No: {studentRollNo}</span>
          </div>
        </div>
      </div>

      {/* Main Attendance Verification Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Card Header: Today's Class */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
                Today&apos;s Class
              </span>
              {activeSession?.status === 'ACTIVE' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  Session Live
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Subject: {displaySubject}
            </h3>
            <p className="text-xs text-slate-300 flex items-center space-x-2">
              <span>Teacher: <strong className="text-white">{displayTeacher}</strong></span>
              {activeSession && (
                <>
                  <span>•</span>
                  <span>Period: {activeSession.classPeriod}</span>
                </>
              )}
            </p>
          </div>

          {activeSession && (
            <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl flex flex-col items-center sm:items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Session ID</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{activeSession.sessionId}</span>
            </div>
          )}
        </div>

        {/* Verification Steps Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* STEP 1: GPS LOCATION CHECK */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    gpsStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-700'
                      : gpsStatus === 'failed'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Step 1: 📍 GPS Location Check</h4>
                  <p className="text-[11px] text-slate-500">
                    Checking device coordinates against campus geofence (&le; {campusSettings.allowedRadius}m allowed)
                  </p>
                </div>
              </div>

              {/* Status Indicator Badge */}
              <div>
                {gpsStatus === 'checking' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Checking Location...</span>
                  </span>
                )}
                {gpsStatus === 'verified' && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>🟢 Location Verified</span>
                  </span>
                )}
                {gpsStatus === 'failed' && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>🔴 Verification Failed</span>
                  </span>
                )}
              </div>
            </div>

            {/* GPS Feedback Banners */}
            {gpsStatus === 'checking' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center space-x-3">
                <Compass className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <span className="font-bold">📍 Checking your location...</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Querying device Geolocation API and measuring distance to {campusSettings.collegeName}...
                  </p>
                </div>
              </div>
            )}

            {gpsStatus === 'verified' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-emerald-900">✅ Location Verified</h5>
                    <p className="text-emerald-800 font-medium mt-0.5">
                      You are inside the college campus.
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Distance: <strong className="text-emerald-900">{formatDistance(distanceFromCollege || 82)}</strong> (Allowed radius: {campusSettings.allowedRadius} meters)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckLocation()}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-check GPS</span>
                </button>
              </div>
            )}

            {gpsStatus === 'failed' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-rose-900">❌ Location Verification Failed</h5>
                    <p className="text-rose-800 font-medium mt-0.5">
                      You are outside the permitted attendance area.
                    </p>
                    <p className="text-[11px] text-rose-700 mt-1">
                      Distance: <strong className="text-rose-900">{formatDistance(distanceFromCollege || 1800)}</strong>
                    </p>
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Please enter the college campus and try again.
                    </p>
                    {gpsErrorMsg && (
                      <p className="text-[10px] text-rose-500 mt-1 italic">{gpsErrorMsg}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckLocation()}
                  className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold shadow-xs"
                >
                  Retry GPS
                </button>
              </div>
            )}

            {/* Quick Testing & Simulation Controls */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Simulation Controls (for testing in iframe/preview environment):</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCheckLocation(82)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-bold text-emerald-700 transition shadow-xs"
                >
                  🎯 Inside Campus (82m)
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckLocation(1800)}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg text-[11px] font-bold text-rose-700 transition shadow-xs"
                >
                  🏃 Outside (1.8km)
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckLocation()}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold text-blue-700 transition shadow-xs"
                >
                  📍 Device GPS
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: SCAN ATTENDANCE QR */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    gpsStatus === 'verified'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Step 2: 📷 Scan Attendance QR</h4>
                  <p className="text-[11px] text-slate-500">
                    Use your device camera to scan the teacher&apos;s dynamic session QR
                  </p>
                </div>
              </div>

              {/* Toggle Buttons */}
              {gpsStatus === 'verified' && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalScannerOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Fullscreen Scanner</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-Page Device Camera Viewfinder View */}
            {gpsStatus === 'verified' ? (
              <div className="space-y-3">
                {isCameraActive ? (
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-video sm:aspect-[16/9] max-h-[380px] flex items-center justify-center shadow-lg border-2 border-emerald-500">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning Reticle & Laser line overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg -mt-1 -ml-1" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg -mt-1 -mr-1" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg -mb-1 -ml-1" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg -mb-1 -mr-1" />
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
                      </div>
                    </div>

                    {/* Camera Control Overlay Bar */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 transition"
                      >
                        <CameraOff className="w-3.5 h-3.5" />
                        <span>Stop Camera</span>
                      </button>
                    </div>

                    <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 text-emerald-300 text-[11px] font-semibold backdrop-blur-md">
                        Align instructor QR code inside the box
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      disabled={isVerifying}
                      className="w-full sm:flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{isVerifying ? 'VERIFYING...' : '[ SCAN QR CODE ]'}</span>
                    </button>

                    {activeSession && (
                      <button
                        type="button"
                        onClick={() => {
                          const payload: AttendanceQrPayload = {
                            sessionId: activeSession.sessionId,
                            subject: activeSession.subjectName,
                            date: activeSession.date,
                            expiresAt: activeSession.expiresAt,
                            randomToken: activeSession.qrToken,
                          };
                          handleVerifyQrPayload(payload);
                        }}
                        className="w-full sm:w-auto py-4 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2"
                        title="Quick scan currently active lecture QR code"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Quick Scan Active Class</span>
                      </button>
                    )}

                    <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center space-x-1.5 py-4 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-2xl transition">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Upload QR Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}

                {cameraError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-xs flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0" />
                <p>
                  QR scanner is locked. Please complete <strong>Step 1</strong> and verify your location inside the college campus first.
                </p>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* ATTENDANCE RESULTS FEEDBACK */}
          {/* ---------------------------------------------------- */}

          {/* 1. SUCCESS: Prompt Section 7 */}
          {resultType === 'success' && successfulRecord && (
            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-4 shadow-md animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-900">
                    🎉 Attendance Marked Successfully
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Verified and recorded in Cloud Firestore.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-emerald-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Student</span>
                  <span className="font-bold text-slate-900">{successfulRecord.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Roll No</span>
                  <span className="font-mono font-bold text-blue-700">{successfulRecord.rollNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Subject</span>
                  <span className="font-bold text-slate-900">{successfulRecord.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
                  <span className="font-medium text-slate-700">{successfulRecord.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Time</span>
                  <span className="font-medium text-slate-700">{successfulRecord.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    PRESENT
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-800 pt-1">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>📍 Location: Verified ({formatDistance(successfulRecord.distanceFromCollege)})</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>📷 QR: Verified</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Session: {successfulRecord.sessionId}</span>
                </span>
              </div>
            </div>
          )}

          {/* 2. DUPLICATE: Prompt Section 8 */}
          {resultType === 'already_marked' && (
            <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-md animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-amber-900">
                    ⚠️ Attendance Already Marked
                  </h4>
                  <p className="text-xs text-amber-800">
                    You have already marked attendance for this class.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recorded Time</span>
                  <span className="font-bold text-slate-800">
                    {successfulRecord ? successfulRecord.time : '10:07 AM'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    PRESENT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Anti-Proxy Protection</span>
                  <span className="text-emerald-700 font-semibold">Single entry per student enforced</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. ERROR */}
          {resultType === 'error' && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start space-x-3 animate-in fade-in">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-rose-900">Verification Rejected</h5>
                <p className="mt-0.5 text-rose-800">{resultMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verified Attendance History & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Verified Sessions Log (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>My Verified Attendance History</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {verifiedRecords.length} records verified
            </span>
          </div>

          <div className="space-y-3">
            {verifiedRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No attendance sessions scanned yet today. Mark attendance above to record presence!
              </div>
            ) : (
              verifiedRecords.map((rec) => (
                <div
                  key={rec.recordId}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {rec.sessionId}
                      </span>
                      <span className="font-bold text-slate-900">{rec.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {rec.date} at {rec.time} • GPS: {formatDistance(rec.distanceFromCollege)}
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {rec.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Semester Course Attendance Rates (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Overall Semester Standing</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700">{overallPercentage}% Overall</span>
          </div>

          <div className="space-y-3">
            {attendance.map((sub) => {
              const pct = sub.totalClasses > 0 ? Math.round((sub.attendedClasses / sub.totalClasses) * 100) : 0;
              const isShort = pct < 75;

              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{sub.subjectName}</span>
                    <span className={`font-bold ${isShort ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {sub.attendedClasses}/{sub.totalClasses} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isShort ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {overallPercentage < 75 ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Keep attending upcoming lectures to maintain eligibility above 75%.</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Good standing! Your attendance qualifies for semester examinations.</span>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal Scanner */}
      <QrScannerModal
        isOpen={isModalScannerOpen}
        onClose={() => setIsModalScannerOpen(false)}
        onScanSuccess={handleVerifyQrPayload}
        activeLectureHint={
          activeSession
            ? {
                sessionId: activeSession.sessionId,
                subject: activeSession.subjectName,
                date: activeSession.date,
                expiresAt: activeSession.expiresAt,
                randomToken: activeSession.qrToken,
              }
            : null
        }
      />
    </div>
  );
};
