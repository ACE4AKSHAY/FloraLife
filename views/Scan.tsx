import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, Lightbulb, Info, Leaf, ChevronLeft, ShieldAlert, ShieldCheck, Sprout, ClipboardList } from 'lucide-react';
import { analyzePlantImage } from '../services/geminiService';
import {
  clearStoredGeminiApiKey,
  getGeminiApiKeySource,
  hasGeminiApiKey,
  MISSING_GEMINI_API_KEY_MESSAGE,
  saveStoredGeminiApiKey,
} from '../services/geminiKeyService';
import type { GeminiApiKeySource } from '../services/geminiKeyService';
import { runOfflineModel } from '../services/tfliteService';
import { ScanResult } from '../types';

import {
  Camera as CapCamera,
  CameraResultType,
  CameraSource,
  PermissionStatus
} from "@capacitor/camera";

interface ScanViewProps {
  onBackHome: () => void;
  onBusyChange?: (busy: boolean) => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onBackHome, onBusyChange }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanMode, setScanMode] = useState<'online' | 'offline'>('online');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [geminiKeySource, setGeminiKeySource] = useState<GeminiApiKeySource>('missing');
  const [showGeminiKeyEditor, setShowGeminiKeyEditor] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const isMountedRef = useRef(true);
  const activeScanJobRef = useRef(0);

  const refreshGeminiKeyState = () => {
    setGeminiKeySource(getGeminiApiKeySource());
  };

  useEffect(() => {
    refreshGeminiKeyState();

    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  useEffect(() => {
    onBusyChange?.(isScanning);
  }, [isScanning, onBusyChange]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeScanJobRef.current += 1;
      onBusyChange?.(false);
    };
  }, [onBusyChange]);

  const analyzeImage = async (base64: string) => {
    if (scanMode === "online" && isOnline) {
      return analyzePlantImage(base64);
    }

    return runOfflineModel(base64);
  };

  const readBlobAsBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataUrl = reader.result as string | null;

        if (!dataUrl) {
          reject(new Error('No image data found.'));
          return;
        }

        resolve(dataUrl.split(',')[1]);
      };

      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(blob);
    });

  const takeCameraPhoto = async (): Promise<string | null> => {
    try {
      let perm: PermissionStatus = await CapCamera.checkPermissions();

      if (perm.camera !== "granted") {
        perm = await CapCamera.requestPermissions({ permissions: ["camera"] });
      }

      if (perm.camera !== "granted") return null;

      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      return image.webPath ?? null;
    } catch {
      return null;
    }
  };

  const pickGalleryPhoto = async (): Promise<string | null> => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      return image.webPath ?? null;
    } catch {
      return null;
    }
  };

  const scanFromPath = async (path: string) => {
    const scanJobId = activeScanJobRef.current + 1;
    activeScanJobRef.current = scanJobId;
    setIsScanning(true);
    setResult(null);

    try {
      const res = await fetch(path);
      const blob = await res.blob();
      const base64 = await readBlobAsBase64(blob);

      if (!isMountedRef.current || activeScanJobRef.current !== scanJobId) {
        return;
      }

      const scanRes = await analyzeImage(base64);

      if (!isMountedRef.current || activeScanJobRef.current !== scanJobId) {
        return;
      }

      setResult(scanRes);
    } catch (error) {
      if (isMountedRef.current && activeScanJobRef.current === scanJobId) {
        const message = error instanceof Error ? error.message : 'Scanning failed. Please try again.';
        alert(message);
      }
    } finally {
      if (isMountedRef.current && activeScanJobRef.current === scanJobId) {
        setIsScanning(false);
      }
    }
  };

  const cancelScan = () => {
    activeScanJobRef.current += 1;
    setIsScanning(false);
  };

  const ensureOnlineScanReady = () => {
    if (scanMode !== 'online' || !isOnline) {
      return true;
    }

    if (!hasGeminiApiKey()) {
      setShowGeminiKeyEditor(true);
      alert(MISSING_GEMINI_API_KEY_MESSAGE);
      return false;
    }

    return true;
  };

  const handleCameraScan = async () => {
    if (!ensureOnlineScanReady()) {
      return;
    }

    const path = await takeCameraPhoto();
    if (path) scanFromPath(path);
  };

  const handleGalleryScan = async () => {
    if (!ensureOnlineScanReady()) {
      return;
    }

    const path = await pickGalleryPhoto();
    if (path) scanFromPath(path);
  };

  const handleSaveGeminiKey = () => {
    const cleanedKey = geminiKeyInput.trim();

    if (!cleanedKey) {
      alert('Paste a Gemini API key first.');
      return;
    }

    saveStoredGeminiApiKey(cleanedKey);
    setGeminiKeyInput('');
    setShowGeminiKeyEditor(false);
    refreshGeminiKeyState();
    alert('Personal Gemini key saved on this device.');
  };

  const handleClearGeminiKey = () => {
    clearStoredGeminiApiKey();
    setGeminiKeyInput('');
    setShowGeminiKeyEditor(false);
    refreshGeminiKeyState();
    alert('Saved personal Gemini key removed from this device.');
  };

  const getStatusTitle = (status: ScanResult['status']) => {
    if (status === 'Healthy') return 'Healthy Plant';
    if (status === 'Needs Review') return 'Review Needed';
    return 'Potential Issue';
  };

  const getStatusClasses = (status: ScanResult['status']) => {
    if (status === 'Healthy') {
      return {
        chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        bar: 'bg-emerald-500',
        icon: <ShieldCheck size={18} />,
      };
    }

    if (status === 'Needs Review') {
      return {
        chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        bar: 'bg-amber-500',
        icon: <ShieldAlert size={18} />,
      };
    }

    return {
      chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      bar: 'bg-orange-500',
      icon: <ShieldAlert size={18} />,
    };
  };

  const renderListCard = (title: string, items: string[] | undefined, icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-100 text-sm">
          {icon}
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={`${title}-${index}`} className="flex gap-3 text-sm text-stone-600 dark:text-stone-300">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#559a73] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (result) {
    const statusClasses = getStatusClasses(result.status);

    return (
      <div className="flex flex-col bg-[#fdfdfb] dark:bg-[#121211] min-h-full pb-10">
        <header className="p-4 bg-white dark:bg-[#1e1e1c] border-b border-stone-100 dark:border-stone-800 flex items-start gap-3">
          <button onClick={onBackHome} className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">AI Plant Scanner</h1>
            <p className="text-xs text-stone-400">Plant health report</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClasses.chip}`}>
                {getStatusTitle(result.status)}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400">
                {result.analysisMode === 'offline' ? 'Offline AI' : 'Online AI'}
              </span>
              {result.cropName && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#8b7e74]/10 text-[#8b7e74] dark:bg-[#5c534d]/20 dark:text-stone-300">
                  {result.cropName}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video sm:aspect-square max-h-[320px]">
            <img src={result.imageUrl} className="w-full h-full object-cover" alt={result.diseaseName} />
            <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm p-4 text-white">
              <p className="text-sm font-black leading-tight">{result.diseaseName}</p>
              <p className="text-[11px] text-white/75 mt-1">{result.description}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-200 text-sm">
              {statusClasses.icon}
              <span>Health Assessment</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-4xl font-black text-stone-800 dark:text-stone-100">
                  {result.confidence}%
                </div>
                <p className="text-xs text-stone-400 mt-1">Match confidence</p>
              </div>
              {result.severity && (
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Severity</p>
                  <p className="text-sm font-black text-stone-800 dark:text-stone-100">{result.severity}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                <span>Overall Match</span>
                <span>{result.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${statusClasses.bar}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-100 text-sm">
              <Sprout size={18} />
              <span>Stage Insight</span>
            </div>
            <p className="text-sm font-black text-stone-800 dark:text-stone-100">{result.growthStage}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">{result.growthStageDescription}</p>
          </div>

          {renderListCard('Recommended Actions', result.recommendations, <Lightbulb size={18} />)}
          {renderListCard('Common Symptoms', result.symptoms, <ClipboardList size={18} />)}
          {renderListCard('Why This Happens', result.causes, <Info size={18} />)}
          {renderListCard('Prevention Plan', result.prevention, <CheckCircle2 size={18} />)}

          {(result.sampleImageHint || result.sampleImageTips?.length) && (
            <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-100 text-sm">
                <Leaf size={18} />
                <span>Presentation Sample</span>
              </div>
              {result.sampleImageHint && (
                <p className="text-sm text-stone-600 dark:text-stone-300">{result.sampleImageHint}</p>
              )}
              {result.sampleImageTips && result.sampleImageTips.length > 0 && (
                <div className="space-y-2">
                  {result.sampleImageTips.map((tip, index) => (
                    <div key={`tip-${index}`} className="flex gap-3 text-sm text-stone-600 dark:text-stone-300">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#559a73] shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold"
          >
            Scan Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-6 h-full bg-[#fdfdfb] dark:bg-[#121211]">
      <header className="flex items-start gap-3">
        <button onClick={onBackHome} className="p-2 rounded-2xl bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            AI Plant Scanner
          </h1>
          <p className="text-sm text-stone-400">
            Scan one clear leaf photo
          </p>
        </div>
      </header>

      <div className="flex gap-2">
        <button
          disabled={isScanning || !isOnline}
          onClick={() => !isScanning && setScanMode("online")}
          className={`flex-1 py-2 rounded-xl font-bold text-sm
          ${scanMode === "online"
              ? "bg-emerald-600 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"}
          ${!isOnline || isScanning ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Online AI
        </button>

        <button
          disabled={isScanning}
          onClick={() => !isScanning && setScanMode("offline")}
          className={`flex-1 py-2 rounded-xl font-bold text-sm
          ${scanMode === "offline"
              ? "bg-emerald-600 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"}
          ${isScanning ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Offline AI
        </button>
      </div>

      {scanMode === 'online' && (
        <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl p-4 border border-stone-100 dark:border-stone-800 shadow-sm space-y-3">
          <div>
            <p className="text-sm font-black text-stone-800 dark:text-stone-100">Gemini Key</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              {geminiKeySource === 'personal'
                ? 'Using a personal Gemini key saved only on this device.'
                : geminiKeySource === 'developer'
                  ? 'This build already has a developer key. For public sharing, it is safer to use a personal key instead.'
                  : 'Online AI needs a Gemini API key. Add your own personal key, or keep using Offline AI.'}
            </p>
          </div>

          {showGeminiKeyEditor ? (
            <div className="space-y-3">
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(event) => setGeminiKeyInput(event.target.value)}
                placeholder="Paste Gemini API key"
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-4 py-3 text-sm text-stone-700 dark:text-stone-200 outline-none"
              />
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                Saved only on this device. Not uploaded to GitHub by FloraLife.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSaveGeminiKey}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  Save Key
                </button>
                <button
                  onClick={() => {
                    setGeminiKeyInput('');
                    setShowGeminiKeyEditor(false);
                  }}
                  className="border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                {geminiKeySource === 'personal' && (
                  <button
                    onClick={handleClearGeminiKey}
                    className="border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    Remove Key
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowGeminiKeyEditor(true)}
                className="bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-xl text-sm font-bold"
              >
                {geminiKeySource === 'personal' ? 'Update Key' : 'Add Personal Key'}
              </button>
              {geminiKeySource === 'personal' && (
                <button
                  onClick={handleClearGeminiKey}
                  className="border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-bold"
                >
                  Remove Key
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-8 rounded-[40px] shadow-sm flex flex-col items-center gap-8 relative overflow-hidden">
          <div className="bg-emerald-50 p-10 rounded-full">
            <LeafIcon className="w-20 h-20 text-emerald-600" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-black text-stone-800 dark:text-stone-100">
              {scanMode === 'offline' ? 'Offline scan' : 'Online scan'}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              {scanMode === 'offline'
                ? 'Works without internet.'
                : 'Uses Gemini when internet is available.'}
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <button
              disabled={isScanning}
              onClick={handleCameraScan}
              className="flex-1 bg-emerald-600 text-white p-6 rounded-3xl flex flex-col items-center gap-2 font-bold shadow-lg"
            >
              {isScanning ? <RefreshCw className="animate-spin" size={24} /> : <Camera size={24} />}
              <span className="text-sm">Camera</span>
            </button>

            <button
              disabled={isScanning}
              onClick={handleGalleryScan}
              className="flex-1 bg-[#8c7e73] text-white p-6 rounded-3xl flex flex-col items-center gap-2 font-bold shadow-lg"
            >
              {isScanning ? <RefreshCw className="animate-spin" size={24} /> : <Upload size={24} />}
              <span className="text-sm">Upload</span>
            </button>
          </div>

          {isScanning && (
            <div className="w-full space-y-3">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Scanning in progress
              </p>
              <button
                onClick={cancelScan}
                className="w-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 py-3 rounded-2xl font-bold"
              >
                Cancel Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Replace this inline icon with the final FloraLife logo when the brand asset is ready.
const LeafIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a13 13 0 0 1-13 13L11 20z" />
    <path d="M9 21c0-4.5 2-9 11-13" />
  </svg>
);

export default ScanView;
