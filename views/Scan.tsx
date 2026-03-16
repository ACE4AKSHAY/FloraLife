import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, Lightbulb, ChevronRight, Info, Leaf } from 'lucide-react';
import { analyzePlantImage } from '../services/geminiService';
import { runOfflineModel } from '../services/tfliteService';
import { ScanResult } from '../types';

import {
  Camera as CapCamera,
  CameraResultType,
  CameraSource,
  PermissionStatus
} from "@capacitor/camera";

const ScanView: React.FC = () => {

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const [scanMode, setScanMode] = useState<'online' | 'offline'>('online');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const analyzeImage = async (base64: string) => {
    let scanRes;

    if (scanMode === "online" && isOnline) {
      scanRes = await analyzePlantImage(base64);
    } else {
      scanRes = await runOfflineModel(base64);
    }

    return scanRes;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setResult(null);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];

      try {
        const scanRes = await analyzeImage(base64);
        setResult(scanRes);
      } catch {
        alert("Scanning failed. Please try again.");
      } finally {
        setIsScanning(false);
      }
    };

    reader.readAsDataURL(file);
  };

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

    setIsScanning(true);
    setResult(null);

    try {

      const res = await fetch(path);
      const blob = await res.blob();

      const reader = new FileReader();

      reader.onloadend = async () => {

        const base64 = (reader.result as string).split(",")[1];

        const scanRes = await analyzeImage(base64);

        setResult(scanRes);
        setIsScanning(false);
      };

      reader.readAsDataURL(blob);

    } catch {

      alert("Scanning failed. Please try again.");
      setIsScanning(false);
    }
  };

  const handleCameraScan = async () => {
    const path = await takeCameraPhoto();
    if (path) scanFromPath(path);
  };

  const handleGalleryScan = async () => {
    const path = await pickGalleryPhoto();
    if (path) scanFromPath(path);
  };

  if (result) {

    return (
      <div className="flex flex-col bg-[#fdfdfb] dark:bg-[#121211] min-h-full pb-10">

        <header className="p-4 bg-white dark:bg-[#1e1e1c] border-b border-stone-100 dark:border-stone-800">
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">AI Plant Scanner</h1>
          <p className="text-xs text-stone-400">Analyze plant health & growth</p>
        </header>

        <div className="p-4 space-y-4">

          <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video sm:aspect-square max-h-[300px]">

            <img src={result.imageUrl} className="w-full h-full object-cover" />

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 flex justify-between items-center text-white">

              <span className="text-xs font-medium truncate pr-4">
                {result.diseaseName} live plant
              </span>

              <button className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                Visit <ChevronRight size={12} />
              </button>

            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-4">

            <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-200 text-sm">
              <CheckCircle2 size={18} /> Health Assessment
            </div>

            <div className="flex items-center gap-6">

              <div className="text-4xl font-black text-stone-800 dark:text-stone-100">
                {result.confidence}%
              </div>

              <div>

                <div className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                  {result.status === 'Healthy' ? 'Healthy Plant!' : 'Potential Issue'}
                </div>

                <p className="text-xs text-stone-400 mt-0.5">
                  {result.description}
                </p>

              </div>

            </div>

            <div className="space-y-1.5">

              <div className="flex justify-between text-[10px] text-stone-400 font-bold">
                <span>Overall Health</span>
                <span>{result.confidence}%</span>
              </div>

              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full ${result.status === 'Healthy' ? 'bg-emerald-500' : 'bg-orange-400'}`}
                  style={{ width: `${result.confidence}%` }}
                />

              </div>

            </div>

          </div>

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

      <header>

        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
          AI Plant Scanner
        </h1>

        <p className="text-sm text-stone-400">
          Analyze plant health & growth
        </p>

      </header>

      {/* MODE SELECTOR */}

      <div className="flex gap-2">

        <button
          disabled={!isOnline}
          onClick={() => setScanMode("online")}
          className={`flex-1 py-2 rounded-xl font-bold text-sm
          ${scanMode === "online"
              ? "bg-emerald-600 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"}
          ${!isOnline ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Online AI
        </button>

        <button
          onClick={() => setScanMode("offline")}
          className={`flex-1 py-2 rounded-xl font-bold text-sm
          ${scanMode === "offline"
              ? "bg-emerald-600 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"}`}
        >
          Offline AI
        </button>

      </div>

      <div className="flex-1 flex flex-col items-center justify-center">

        <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-8 rounded-[40px] shadow-sm flex flex-col items-center gap-8 relative overflow-hidden">

          <div className="bg-emerald-50 p-10 rounded-full">
            <LeafIcon className="w-20 h-20 text-emerald-600" />
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

        </div>

      </div>

    </div>
  );
};

const LeafIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a13 13 0 0 1-13 13L11 20z" />
    <path d="M9 21c0-4.5 2-9 11-13" />
  </svg>
);

export default ScanView;