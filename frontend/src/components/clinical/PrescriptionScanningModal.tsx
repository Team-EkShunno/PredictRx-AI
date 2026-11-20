import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface PrescriptionScanningModalProps {
  isOpen: boolean;
  onClose?: () => void;
  filePreview: string | null;
  fileName?: string;
  isAnalyzing?: boolean;
}

const SCAN_STEPS_EN = [
  { id: 1, label: 'Document Perception & Optical Text Extraction' },
  { id: 2, label: 'Medications, Dosage & Frequency Synthesis' },
  { id: 3, label: 'DGDA National Formulary & Safety Screening' },
];

const SCAN_STEPS_BN = [
  { id: 1, label: 'প্রেসক্রিপশন ইমেজ রিডিং ও পাঠোদ্ধার' },
  { id: 2, label: 'ওষুধের নাম, মাত্রা ও সেবনবিধি শনাক্তকরণ' },
  { id: 3, label: 'জাতীয় ড্রাগ ফর্মুলারি ও সেফটি স্ক্রিনিং' },
];

export const PrescriptionScanningModal: React.FC<PrescriptionScanningModalProps> = ({
  isOpen,
  filePreview,
  fileName,
}) => {
  const { i18n } = useTranslation();
  const isBn = Boolean(i18n.language && i18n.language.startsWith('bn'));
  const steps = isBn ? SCAN_STEPS_BN : SCAN_STEPS_EN;

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(18);
      return;
    }

    // Step progression synced with typical AI OCR turnaround
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2400);

    // Smooth, realistic progress bar advancement
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 94) {
          return prev + Math.floor(Math.random() * 4) + 2;
        }
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, steps.length]);

  return (
    <Dialog open={isOpen} onOpenChange={() => { /* Locked during analysis */ }}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-[440px] w-[92vw] p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_35px_rgba(16,185,129,0.15)] rounded-2xl sm:rounded-2xl gap-0 [&>button]:hidden"
      >
        {/* Top Header - National Project Style */}
        <div className="px-5 pt-5 pb-3.5 border-b border-border/50 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-emerald-800 dark:text-emerald-300">
                {isBn ? 'জাতীয় এআই প্রেসক্রিপশন কোর' : 'National AI Prescription Core'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">
              PredictRx CDSS
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground tracking-tight mt-2.5">
            {isBn ? 'প্রেসক্রিপশন এআই বিশ্লেষণ চলছে' : 'Prescription AI Analysis in Progress'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBn
              ? 'ওষুধের তালিকা, মাত্রা ও রোগীর তথ্য প্রক্রিয়াকরণ করা হচ্ছে...'
              : 'Extracting medications, dosing regimens and clinical parameters...'}
          </p>
        </div>

        {/* Viewport: Optical Scanning Window */}
        <div className="relative bg-slate-950 p-4 flex items-center justify-center min-h-[190px] max-h-[220px] overflow-hidden select-none border-b border-emerald-950/40">
          {/* Subtle Ambient Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

          {/* Prescription Image or Minimal Document Placeholder */}
          {filePreview ? (
            <img
              src={filePreview}
              alt="Prescription Scan Viewport"
              className="max-h-[175px] w-auto max-w-full object-contain rounded-md shadow-2xl border border-emerald-500/30 opacity-95 transition-all duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-emerald-400">
              <FileText className="h-12 w-12 mb-2 opacity-60 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider text-emerald-300/80">
                {fileName || 'PRESCRIPTION_DOCUMENT'}
              </span>
            </div>
          )}

          {/* Precision Laser Scanning Beam */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981,0_0_25px_#34d399] animate-laser-sweep pointer-events-none">
            {/* Soft Ambient Light Glow */}
            <div className="absolute -inset-x-0 top-0 h-6 bg-gradient-to-b from-emerald-400/20 to-transparent pointer-events-none" />
          </div>

          {/* Precision Viewfinder Corners */}
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-sm" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-sm" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-sm" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400/80 rounded-br-sm" />

          {/* Minimal Status Indicators */}
          <div className="absolute top-3 left-4 text-[9px] font-mono text-emerald-400/90 tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>AI SCAN // ACTIVE</span>
          </div>

          {fileName && (
            <div className="absolute bottom-2.5 left-4 text-[9px] font-mono text-slate-400/80 tracking-wider truncate max-w-[220px]">
              {fileName}
            </div>
          )}
        </div>

        {/* Live Stepper & Progress Section */}
        <div className="p-5 space-y-4 bg-card">
          {/* Progress bar with percentage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <span>{steps[currentStep].label}</span>
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-muted overflow-hidden" />
          </div>

          {/* Minimal Clean Step Checklist */}
          <div className="space-y-2 pt-0.5">
            {steps.map((st, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={st.id}
                  className={`flex items-center gap-2.5 text-xs transition-colors duration-200 ${
                    isCurrent
                      ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                      : isPast
                      ? 'text-foreground/85 font-medium'
                      : 'text-muted-foreground/45'
                  }`}
                >
                  <div className="shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                    ) : (
                      <Circle className="h-3 w-3 opacity-30" />
                    )}
                  </div>
                  <span className="truncate">{st.label}</span>
                </div>
              );
            })}
          </div>

          {/* Footer - Lock Notice */}
          <div className="pt-3 border-t border-border/50 flex items-center justify-center text-center">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isBn
                ? 'অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন, উইন্ডোটি বন্ধ করবেন না'
                : 'Please wait a few seconds, do not close this window'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
