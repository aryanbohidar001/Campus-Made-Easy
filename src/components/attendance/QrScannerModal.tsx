import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { AttendanceQrPayload } from '../../types';
import {
  Camera,
  X,
  Upload,
  AlertTriangle,
  Zap,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (payload: AttendanceQrPayload) => void;
  activeLectureHint?: AttendanceQrPayload | null;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  activeLectureHint,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Stop video stream and scanning loop
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Parse QR text into AttendanceQrPayload
  const processQrText = useCallback(
    (text: string) => {
      try {
        let payload: AttendanceQrPayload | null = null;
        if (text.startsWith('{') && text.endsWith('}')) {
          payload = JSON.parse(text);
        } else if (text.includes('sessionId:') || text.includes('randomToken:')) {
          // Parse key-value formatted text
          const lines = text.split('\n');
          const data: any = {};
          lines.forEach((line) => {
            const [k, ...v] = line.split(':');
            if (k && v) {
              data[k.trim()] = v.join(':').trim();
            }
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
          setIsScanning(false);
          setScannedFeedback('QR Code Verified!');
          stopCamera();
          setTimeout(() => {
            onScanSuccess(payload);
          }, 400);
        } else {
          setCameraError('Unrecognized QR format. Please scan the official campus attendance QR code.');
        }
      } catch (err) {
        setCameraError('Could not decode QR payload. Please try again.');
      }
    },
    [onScanSuccess, stopCamera]
  );

  // Frame scanning loop
  const tick = useCallback(() => {
    if (!isScanning) return;
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
          processQrText(code.data);
          return;
        }
      }
    }

    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [isScanning, processQrText]);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setIsScanning(true);
    setCameraError(null);
    setScannedFeedback(null);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this device/browser.');
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          });
        } catch {
          // Fallback to default video camera for desktops, laptops, or webcams without environment lens
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
          await videoRef.current.play();
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      } catch (err: any) {
        console.warn('Camera initialization error:', err);
        setCameraError(
          err.message || 'Camera permission denied or camera device unavailable. You can upload an image or scan the active session below.'
        );
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera, tick]);

  // Handle image upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            processQrText(code.data);
          } else {
            setCameraError('No valid QR code found in the selected image. Please try another photo.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick simulate scan for active lecture
  const handleSimulateActiveScan = () => {
    if (activeLectureHint) {
      processQrText(JSON.stringify(activeLectureHint));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Scan Attendance QR</h3>
              <p className="text-[11px] text-slate-400">Align camera with the instructor&apos;s dynamic QR code</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Camera Body */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* Real video feed */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay Guides */}
          {!cameraError && isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer shaded mask */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg -mb-1 -mr-1" />

                {/* Animated laser scanning bar */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite] opacity-80" />

                <div className="absolute -bottom-8 inset-x-0 text-center">
                  <span className="text-[11px] font-semibold text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Align QR inside frame
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Feedback Flash */}
          {scannedFeedback && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-20">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
              <h4 className="text-xl font-bold">{scannedFeedback}</h4>
              <p className="text-xs text-emerald-200 mt-1">Verifying GPS geofence and roll number...</p>
            </div>
          )}

          {/* Camera Error or Fallback Message */}
          {cameraError && (
            <div className="p-6 text-center text-white max-w-sm flex flex-col items-center z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">Camera Unavailable</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {cameraError}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer & Alternate Scan Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Quick test with active session button */}
          {activeLectureHint && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-emerald-900">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  Active Lecture Detected: <strong>{activeLectureHint.subject}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleSimulateActiveScan}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Scan Now
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {/* File Upload Option */}
            <label className="flex-1 cursor-pointer flex items-center justify-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition shadow-xs">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload QR Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Manual Token Fallback */}
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>{showManualInput ? 'Hide Code' : 'Enter QR Code'}</span>
            </button>
          </div>

          {/* Manual Input Dropdown */}
          {showManualInput && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Paste QR Payload or Session Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder='{"sessionId":"...","randomToken":"..."}'
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualTokenInput.trim()) {
                      processQrText(manualTokenInput.trim());
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
