"use client";

import { useState, useRef } from "react";
import { Phone } from "../lib/api";
import AppIcon from "./AppIcon";


interface SubmitBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: Phone;
}

export default function SubmitBenchmarkModal({ isOpen, onClose, phone }: SubmitBenchmarkModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [customDeviceName, setCustomDeviceName] = useState(phone?.name || "");
  const [processor, setProcessor] = useState(phone?.specs?.performance?.chipset || "");
  const [userName, setUserName] = useState("");
  const [androidVersion, setAndroidVersion] = useState("");
  const [memoryConfig, setMemoryConfig] = useState("");
  const [comment, setComment] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Benchmark active sections
  const [showAntutu, setShowAntutu] = useState(false);
  const [showGeekbench, setShowGeekbench] = useState(false);

  // Antutu state
  const [antutuTotal, setAntutuTotal] = useState("");
  const [antutuCpu, setAntutuCpu] = useState("");
  const [antutuGpu, setAntutuGpu] = useState("");
  const [antutuMemory, setAntutuMemory] = useState("");
  const [antutuUx, setAntutuUx] = useState("");

  // Geekbench state
  const [geekbenchSingle, setGeekbenchSingle] = useState("");
  const [geekbenchMulti, setGeekbenchMulti] = useState("");
  const [geekbenchCompute, setGeekbenchCompute] = useState("");



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      setError("Please upload a screenshot of the results.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("phone_slug", phone.slug);
      formData.append("device_name", customDeviceName || phone.name);
      formData.append("processor", processor);
      formData.append("user_name", userName);
      formData.append("android_version", androidVersion);
      formData.append("memory_config", memoryConfig);
      formData.append("comment", comment);
      formData.append("screenshot", screenshot);

      const benchmarks: any = {};
      if (showAntutu) {
        benchmarks.antutu = {
          total: Number(antutuTotal) || 0,
          cpu: Number(antutuCpu) || 0,
          gpu: Number(antutuGpu) || 0,
          memory: Number(antutuMemory) || 0,
          ux: Number(antutuUx) || 0,
        };
      }
      if (showGeekbench) {
        benchmarks.geekbench = {
          single_core: Number(geekbenchSingle) || 0,
          multi_core: Number(geekbenchMulti) || 0,
          compute: Number(geekbenchCompute) || 0,
        };
      }
      formData.append("benchmarks", JSON.stringify(benchmarks));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${API_URL}/benchmarks`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit benchmark.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-white dark:bg-surface-container rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-border-subtle">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 px-6 border-b border-border-subtle bg-surface-white/95 dark:bg-surface-container/95 backdrop-blur">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <AppIcon name="analytics" size={20} className="text-primary" />
            Add Benchmark Results
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low text-text-muted hover:text-text-main transition-colors cursor-pointer">
            <AppIcon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-10 flex flex-col items-center">
              <AppIcon name="check_circle" size={56} className="text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-text-main mb-2">Submitted Successfully!</h3>
              <p className="text-text-muted mb-6">Your benchmark results have been submitted and are pending review.</p>
              <button onClick={onClose} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold cursor-pointer">Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-text-muted">
                Using this form, you can add your benchmark results to the database. This will help us improve the accuracy of comparisons and ratings.
              </p>

              {error && (
                <div className="p-3 bg-error/10 text-error rounded-xl text-sm border border-error/20 flex items-center gap-2">
                  <AppIcon name="error" size={18} />
                  {error}
                </div>
              )}

              {/* Device Section */}
              <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-text-main text-sm uppercase tracking-wider mb-2 border-b border-border-subtle pb-2"># Device</h3>
                



                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1">Device Name*</label>
                  <input required type="text" value={customDeviceName} onChange={(e) => setCustomDeviceName(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" placeholder="e.g. Samsung Galaxy S21" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1">Processor (SoC)*</label>
                  <input required type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Benchmark Selectors */}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setShowAntutu(!showAntutu)} className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${showAntutu ? 'border-primary text-primary bg-primary/5' : 'border-border-subtle text-text-muted hover:bg-surface-container-low'}`}>
                  <AppIcon name={showAntutu ? 'remove' : 'add'} size={18} />
                  ANTUTU V11
                </button>
                <button type="button" onClick={() => setShowGeekbench(!showGeekbench)} className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${showGeekbench ? 'border-primary text-primary bg-primary/5' : 'border-border-subtle text-text-muted hover:bg-surface-container-low'}`}>
                  <AppIcon name={showGeekbench ? 'remove' : 'add'} size={18} />
                  GEEKBENCH V6
                </button>
              </div>

              {/* Antutu Section */}
              {showAntutu && (
                <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-text-main text-sm uppercase tracking-wider mb-2 border-b border-border-subtle pb-2"># AnTuTu v11</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">Total score*</label>
                      <input required type="number" value={antutuTotal} onChange={(e) => setAntutuTotal(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">CPU score</label>
                      <input type="number" value={antutuCpu} onChange={(e) => setAntutuCpu(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">GPU score</label>
                      <input type="number" value={antutuGpu} onChange={(e) => setAntutuGpu(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">Memory score</label>
                      <input type="number" value={antutuMemory} onChange={(e) => setAntutuMemory(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">UX score</label>
                      <input type="number" value={antutuUx} onChange={(e) => setAntutuUx(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Geekbench Section */}
              {showGeekbench && (
                <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-text-main text-sm uppercase tracking-wider mb-2 border-b border-border-subtle pb-2"># Geekbench v6</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">Single-Core score</label>
                      <input type="number" value={geekbenchSingle} onChange={(e) => setGeekbenchSingle(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">Multi-Core score</label>
                      <input type="number" value={geekbenchMulti} onChange={(e) => setGeekbenchMulti(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1">Compute (GPU) score</label>
                      <input type="number" value={geekbenchCompute} onChange={(e) => setGeekbenchCompute(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Screenshot */}
              <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5">
                <h3 className="font-bold text-text-main text-sm uppercase tracking-wider mb-2 border-b border-border-subtle pb-2"># Screenshot Evidence*</h3>
                <p className="text-xs text-text-muted mb-3">Please upload a screenshot of the results to confirm the entered data.</p>
                <input required ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              </div>

              {/* Info Section */}
              <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-text-main text-sm uppercase tracking-wider mb-2 border-b border-border-subtle pb-2"># Info</h3>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1">Your Name or Nickname*</label>
                  <input required type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-1">Android version</label>
                    <input type="text" value={androidVersion} onChange={(e) => setAndroidVersion(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-1">Memory configuration</label>
                    <input type="text" value={memoryConfig} onChange={(e) => setMemoryConfig(e.target.value)} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" placeholder="e.g. 8/128GB" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1">Comment (optional)</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full p-2.5 rounded-lg border border-border-subtle bg-surface-white dark:bg-surface-container text-text-main focus:outline-none focus:border-primary" placeholder="Other information (like custom ROM or Kernel) that may affect results." />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <AppIcon name="progress_activity" size={20} className="animate-spin" /> : <AppIcon name="send" size={20} />}
                {loading ? 'Submitting...' : 'Submit Benchmark'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
