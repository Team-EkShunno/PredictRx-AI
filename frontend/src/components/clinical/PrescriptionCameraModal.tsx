import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  RefreshCw,
  X,
  Check,
  FlipHorizontal,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrescriptionCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (capturedFile: File) => void;
}

export const PrescriptionCameraModal: React.FC<PrescriptionCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const { i18n } = useTranslation();
  const isBn = Boolean(i18n.language && i18n.language.startsWith('bn'));

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Stop video stream safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start webcam / device camera
  const startCamera = useCallback(async () => {
    stopStream();
    setIsLoadingCamera(true);
    setCameraError(null);
    setCapturedDataUrl(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsLoadingCamera(false);
    } catch (err: any) {
      setIsLoadingCamera(false);
      setCameraError(
        isBn
          ? 'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজার পারমিশন চেক করুন।'
          : 'Could not access camera. Please allow camera permissions in your browser.'
      );
    }
  }, [facingMode, isBn, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setCameraError(null);
      setIsFullscreen(false);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Take photo from video feed
  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedDataUrl(dataUrl);
      stopStream();
    }
  };

  // Confirm and upload captured photo
  const handleConfirm = () => {
    if (!capturedDataUrl) return;

    // Convert dataURL to File
    const arr = capturedDataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const photoFile = new File([u8arr], `rx_camera_${timestamp}.jpg`, { type: mime });

    onCapture(photoFile);
    onClose();
  };

  // Flip camera (front vs back)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className={cn(
          'p-0 bg-slate-950 text-white gap-0 select-none z-50 flex flex-col justify-between transition-all duration-200 [&>button]:hidden',
          isFullscreen
            ? '!fixed !inset-0 !left-0 !top-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !transform-none !w-screen !w-[100dvw] !h-screen !h-[100dvh] !max-w-none !max-h-none !rounded-none !m-0 !border-0 overflow-hidden z-[999]'
            : 'max-w-xl w-[95vw] h-auto max-h-[90dvh] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0 z-20">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-wide">
              {isBn ? 'প্রেসক্রিপশন ছবি তুলুন (Optical Camera)' : 'Capture Prescription Photo'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Fullscreen Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={
                isFullscreen
                  ? isBn
                    ? 'স্বাভাবিক স্ক্রিন'
                    : 'Exit Fullscreen'
                  : isBn
                  ? 'ফুলস্ক্রিন করুন'
                  : 'Fullscreen'
              }
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Single, Dedicated Close Button (Radix default is hidden) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Viewport Area - Automatically scales without pushing footer offscreen */}
        <div
          className={cn(
            'relative bg-black flex items-center justify-center overflow-hidden min-h-0 flex-1 w-full',
            isFullscreen ? 'h-full' : 'max-h-[62dvh] aspect-[4/3] sm:aspect-auto'
          )}
        >
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 space-y-2">
              <AlertCircle className="h-10 w-10 mx-auto opacity-80" />
              <p className="text-xs">{cameraError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="mt-2 text-xs border-slate-700 hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </Button>
            </div>
          ) : capturedDataUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedDataUrl}
                alt="Captured prescription"
                className="w-full h-full object-contain max-h-full"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-mono tracking-wider">
                CAPTURED // READY
              </div>
            </div>
          ) : (
            <>
              {isLoadingCamera && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-emerald-400 gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="text-xs font-mono">
                    {isBn ? 'ক্যামেরা চালু হচ্ছে...' : 'Initializing Camera...'}
                  </span>
                </div>
              )}

              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-contain max-h-full"
              />

              {/* Viewfinder Target Framing Brackets */}
              <div className="absolute inset-6 sm:inset-10 pointer-events-none border border-emerald-500/25 rounded-lg">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
              </div>

              {/* Top guidance notice */}
              <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                  {isBn
                    ? 'প্রেসক্রিপশনটি ফ্রেমের মাঝে সোজা রাখুন'
                    : 'Position prescription clearly within frame'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls Footer - Pinned to bottom, always visible */}
        <div className="px-4 py-3 sm:py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {capturedDataUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isBn ? 'আবার তুলুন' : 'Retake'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleConfirm}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-medium px-4 shadow-lg shadow-emerald-950"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{isBn ? 'বিশ্লেষণ করুন' : 'Analyze Prescription'}</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleFacingMode}
                disabled={isLoadingCamera || Boolean(cameraError)}
                className="text-xs text-slate-400 hover:text-white gap-1.5"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span>{isBn ? 'ক্যামেরা পাল্টান' : 'Flip Camera'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSnap}
                disabled={isLoadingCamera || Boolean(cameraError)}
                className="rounded-full h-11 w-11 p-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform active:scale-95"
              >
                <div className="h-9 w-9 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-slate-950" />
                </div>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
