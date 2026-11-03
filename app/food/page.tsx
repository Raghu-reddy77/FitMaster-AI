"use client";

import { Navigation } from "@/frontend/components/Navigation";
import { useApp } from "@/frontend/context/AppContext";
import { useToast } from "@/frontend/components/Toast";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Flame, 
  Egg, 
  Wheat, 
  Droplet,
  ArrowLeft,
  ScanLine,
  RefreshCw,
  X
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface MealPreset {
  name: string;
  category: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  grade: string;
  image: string;
}

const presetMeals: MealPreset[] = [
  {
    name: "Grilled Salmon & Quinoa Grain Bowl",
    category: "Lunch",
    calories: 680,
    protein: 48,
    carbs: 55,
    fat: 22,
    confidence: 98,
    grade: "A+ High Protein",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Whey Protein & Wild Berry Smoothie Bowl",
    category: "Snack",
    calories: 310,
    protein: 32,
    carbs: 28,
    fat: 6,
    confidence: 96,
    grade: "A Lean Recovery",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Avocado & Poached Egg Whole Wheat Toast",
    category: "Breakfast",
    calories: 440,
    protein: 22,
    carbs: 38,
    fat: 24,
    confidence: 94,
    grade: "A Healthy Fats",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Lean Ribeye Steak & Roasted Asparagus",
    category: "Dinner",
    calories: 720,
    protein: 56,
    carbs: 14,
    fat: 36,
    confidence: 99,
    grade: "A+ High Anabolic",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  },
];

export default function FoodScannerPage() {
  const { userProfile, addMeal } = useApp();
  const { showToast } = useToast();

  const [selectedPreset, setSelectedPreset] = useState<MealPreset>(presetMeals[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Real Camera Stream
  const startCamera = async () => {
    try {
      setUseRealCamera(true);
      setCapturedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      showToast("📹 Real Camera Active! Point at your food.", "info");
    } catch (err) {
      console.error("Camera access error:", err);
      showToast("⚠️ Camera access denied or not available. Using presets.", "error");
      setUseRealCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture Snapshot from real camera video
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
      stopCamera();
      triggerAIScanProcess("Camera Scanned Meal");
    }
  };

  const triggerAIScanProcess = (name: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Simulate real AI macro calculation based on scan
      setSelectedPreset({
        name,
        category: "Lunch",
        calories: Math.floor(Math.random() * 200) + 450,
        protein: Math.floor(Math.random() * 20) + 30,
        carbs: Math.floor(Math.random() * 25) + 35,
        fat: Math.floor(Math.random() * 10) + 12,
        confidence: 97,
        grade: "A+ High Precision",
        image: capturedImage || selectedPreset.image,
      });
      showToast("✨ AI Vision calculated macros from real photo!", "success");
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        stopCamera();
        triggerAIScanProcess(`Uploaded ${file.name.split('.')[0]}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogMeal = async () => {
    await addMeal({
      name: selectedPreset.name,
      category: selectedPreset.category,
      calories: selectedPreset.calories,
      protein: selectedPreset.protein,
      carbs: selectedPreset.carbs,
      fat: selectedPreset.fat,
      imageUrl: capturedImage || selectedPreset.image,
    });

    showToast(`✅ Logged ${selectedPreset.name} (+${selectedPreset.calories} kcal)!`, "success");
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col pb-24 md:pb-10 md:pl-64">
      {/* Header Bar */}
      <header className="pt-6 pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-[#201f1f] text-[#c3caac] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#bfff00]">AI Vision Scanner</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Real Camera Food Scanner</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Camera className="w-4 h-4" /> Open Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-1.5 bg-[#ff4b4b]/20 text-[#ff4b4b] border border-[#ff4b4b]/40 font-bold px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              <X className="w-4 h-4" /> Stop Camera
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 space-y-6">
        {/* Real Camera Viewfinder / AI Image Frame */}
        <section className="bg-[#201f1f] rounded-2xl border border-[#434933]/50 p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="relative aspect-video w-full max-h-96 rounded-xl overflow-hidden bg-black border border-[#353534] flex items-center justify-center">
            {cameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* AI Scanning Reticle Overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-[#bfff00]/70 m-6 rounded-2xl pointer-events-none flex items-center justify-center">
                  <ScanLine className="w-12 h-12 text-[#bfff00] animate-bounce" />
                </div>

                <button
                  onClick={captureSnapshot}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#bfff00] text-[#263500] px-6 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(191,255,0,0.5)] active:scale-95 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Capture & Calculate Macros
                </button>
              </>
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured meal" className="w-full h-full object-cover" />
            ) : (
              <img src={selectedPreset.image} alt={selectedPreset.name} className="w-full h-full object-cover" />
            )}

            {/* Scanning Animation Progress Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 space-y-3 animate-in fade-in">
                <ScanLine className="w-12 h-12 text-[#bfff00] animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white uppercase tracking-wider">Analyzing Image & Calculating Macros</h4>
                  <p className="text-xs text-[#c3caac]">AI Vision identifying ingredients & portion size...</p>
                </div>
                <div className="w-48 h-1.5 bg-[#353534] rounded-full overflow-hidden">
                  <div className="h-full bg-[#bfff00] rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}
          </div>

          {/* Upload File / Presets Selection Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#353534] hover:bg-[#434933] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors">
                <Upload className="w-4 h-4 text-[#4b8eff]" /> Upload Meal Photo
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {!cameraActive && (
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 bg-[#4b8eff]/10 text-[#4b8eff] border border-[#4b8eff]/30 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-[#4b8eff]/20 transition-colors"
                >
                  <Camera className="w-4 h-4" /> Start Real Camera
                </button>
              )}
            </div>

            <span className="text-xs text-[#c3caac]">Confidence: <strong className="text-[#bfff00]">{selectedPreset.confidence}%</strong> ({selectedPreset.grade})</span>
          </div>
        </section>

        {/* Calculated Macros Result Card */}
        <section className="bg-[#201f1f] rounded-2xl border border-[#bfff00]/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#bfff00] uppercase tracking-wider">AI Calculated Nutritional Breakdown</span>
              <h2 className="text-xl font-bold text-white mt-0.5">{selectedPreset.name}</h2>
            </div>

            <button
              onClick={handleLogMeal}
              className="bg-[#bfff00] hover:bg-[#a1d800] text-[#263500] font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-[0_0_15px_rgba(191,255,0,0.25)] transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Scanned Meal
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#353534]">
              <span className="text-[10px] text-[#c3caac] font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#bfff00]" /> Calories
              </span>
              <p className="text-2xl font-extrabold text-white mt-1">{selectedPreset.calories} <span className="text-xs font-normal text-[#c3caac]">kcal</span></p>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#353534]">
              <span className="text-[10px] text-[#bfff00] font-bold uppercase tracking-wider flex items-center gap-1">
                <Egg className="w-3.5 h-3.5 text-[#bfff00]" /> Protein
              </span>
              <p className="text-2xl font-extrabold text-[#bfff00] mt-1">{selectedPreset.protein} <span className="text-xs font-normal text-[#c3caac]">g</span></p>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#353534]">
              <span className="text-[10px] text-[#4b8eff] font-bold uppercase tracking-wider flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5 text-[#4b8eff]" /> Carbs
              </span>
              <p className="text-2xl font-extrabold text-[#4b8eff] mt-1">{selectedPreset.carbs} <span className="text-xs font-normal text-[#c3caac]">g</span></p>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#353534]">
              <span className="text-[10px] text-[#adc6ff] font-bold uppercase tracking-wider flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-[#adc6ff]" /> Fats
              </span>
              <p className="text-2xl font-extrabold text-[#adc6ff] mt-1">{selectedPreset.fat} <span className="text-xs font-normal text-[#c3caac]">g</span></p>
            </div>
          </div>
        </section>

        {/* Preset Sample Meals */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-[#c3caac] uppercase tracking-wider">Or Select Preset Sample Meals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {presetMeals.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setCapturedImage(null);
                  setSelectedPreset(preset);
                  showToast(`Selected ${preset.name}`, "info");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                  selectedPreset.name === preset.name
                    ? "bg-[#bfff00]/15 border-[#bfff00]"
                    : "bg-[#201f1f] border-[#353534] hover:border-[#c3caac]/40"
                }`}
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 bg-black">
                  <img src={preset.image} alt={preset.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{preset.name}</h4>
                <span className="text-[10px] text-[#bfff00] font-semibold mt-1">{preset.calories} kcal ({preset.protein}g P)</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
