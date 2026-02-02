
import React, { useState, useRef } from 'react';
// Added Leaf to the imports
import { Camera, Upload, RefreshCw, AlertCircle, CheckCircle2, Lightbulb, ChevronRight, Info, Leaf } from 'lucide-react';
import { analyzePlantImage } from '../services/geminiService';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const scanRes = await analyzePlantImage(base64);
        setResult(scanRes);
      } catch (error) {
        alert("Scanning failed. Please try again.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
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
      const scanRes = await analyzePlantImage(base64);
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
      <div className="flex flex-col bg-[#fdfdfb] min-h-full pb-10">
        <header className="p-4 bg-white border-b border-stone-100">
          <h1 className="text-xl font-bold text-stone-800">AI Plant Scanner</h1>
          <p className="text-xs text-stone-400">Analyze plant health & growth</p>
        </header>

        <div className="p-4 space-y-4">
          {/* Image Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video sm:aspect-square max-h-[300px]">
            <img src={result.imageUrl} className="w-full h-full object-cover" alt="Scanned plant" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 flex justify-between items-center text-white">
              <span className="text-xs font-medium truncate pr-4">{result.diseaseName} live plant</span>
              <button className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                Visit <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Health Assessment Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-700 text-sm">
              <CheckCircle2 size={18} className="text-stone-700" /> Health Assessment
            </div>
            <div className="flex items-center gap-6">
              <div className="text-4xl font-black text-stone-800">{result.confidence}%</div>
              <div>
                <div className="font-bold text-stone-800 text-sm">{result.status === 'Healthy' ? 'Healthy Plant!' : 'Potential Issue'} 🌿</div>
                <p className="text-xs text-stone-400 mt-0.5">{result.description}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Overall Health</span>
                <span className="text-[10px] font-bold text-stone-400">{result.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${result.status === 'Healthy' ? 'bg-emerald-500' : 'bg-orange-400'}`}
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Growth Stage Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-4">
            <div className="font-bold text-stone-700 text-sm">Detected Growth Stage</div>
            <div className="bg-[#f2f7f3] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {/* Fixed missing Leaf import */}
                <Leaf className="text-emerald-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-sm">{result.growthStage}</h4>
                <p className="text-xs text-stone-500">{result.growthStageDescription}</p>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-700 text-sm">
              <Lightbulb size={18} className="text-amber-400 fill-amber-400" /> Recommendations
            </div>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-xs text-stone-600 leading-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setResult(null)}
              className="flex-1 border border-stone-200 py-3 rounded-xl font-bold text-stone-600 text-sm hover:bg-stone-50 transition-colors"
            >
              Scan Another
            </button>
            <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors">
              View Care Guides
            </button>
          </div>

          {/* Disclaimer */}
          <div className="flex gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9px] text-stone-400 leading-tight">
              This is a simulated AI analysis for demonstration purposes. For accurate plant diagnosis, consult a professional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-6 h-full bg-[#fdfdfb]">
      <header>
        <h1 className="text-2xl font-bold text-stone-800">AI Plant Scanner</h1>
        <p className="text-sm text-stone-400">Analyze plant health & growth</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm bg-white border border-stone-100 p-8 rounded-[40px] shadow-sm flex flex-col items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="bg-emerald-50 p-10 rounded-full relative z-10">
            <LeafIcon className="w-20 h-20 text-emerald-600" />
          </div>

          <div className="text-center relative z-10">
            <h2 className="text-2xl font-bold mb-2">Scan Your Plant</h2>
            <p className="text-stone-400 text-sm">Take a photo or upload an image to analyze</p>
          </div>

          <div className="flex gap-4 w-full relative z-10">
            <button 
              disabled={isScanning}
              onClick={handleCameraScan}
              className="flex-1 bg-emerald-600 text-white p-6 rounded-3xl flex flex-col items-center gap-2 font-bold shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="animate-spin" size={24} /> : <Camera size={24} />}
              <span className="text-sm">Camera</span>
            </button>
            <button 
              disabled={isScanning}
              onClick={handleGalleryScan}
              className="flex-1 bg-[#8c7e73] text-white p-6 rounded-3xl flex flex-col items-center gap-2 font-bold shadow-lg hover:bg-[#7c6a5a] transition-colors disabled:opacity-50"
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
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a13 13 0 0 1-13 13L11 20z" />
    <path d="M9 21c0-4.5 2-9 11-13" />
  </svg>
);

export default ScanView;
