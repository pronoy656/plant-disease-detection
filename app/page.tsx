'use client';

import React, { useState, useRef } from 'react';
import { Upload, Leaf, X, Image as ImageIcon, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from "../components/theme-toggle";

interface Prediction {
  label: string;
  score: number;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Prediction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    setError(null);
    setResults(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setResults(data);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatLabel = (label: string) => {
    return label.replace(/___/g, ': ').replace(/_/g, ' ');
  };

  const topResult = results && results.length > 0 ? results[0] : null;

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <ThemeToggle />
      </div>

      <section className="text-center mb-16 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FloraScan
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Identify <span className="text-primary">Plant Diseases</span> Instantly
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload a clear photo of your plant's leaf to get an instant AI-powered health diagnosis and treatment suggestions.
        </p>
      </section>

      <section className="max-w-xl mx-auto glass p-8 md:p-12 rounded-[2.5rem] ">
        {!selectedImage ? (
          <div
            className={`drop-zone ${isDragging ? 'scale-[1.02] border-primary-dark bg-primary/20 dark:bg-primary/30' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-primary/10 rounded-full">
                <Upload className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">Click or drag image to upload</h3>
            <p className="text-slate-500 dark:text-slate-400">Support for JPG, PNG and WebP</p>
          </div>
        ) : (
          <div className="animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img src={selectedImage} alt="Plant preview" className="w-full h-auto object-cover max-h-[400px]" />
              {!isAnalyzing && (
                <button
                  className="absolute top-4 right-4 p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  onClick={removeImage}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {!topResult ? (
              <button
                className="btn-primary flex items-center justify-center gap-2"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Health...
                  </>
                ) : (
                  <>
                    Analyze Health
                  </>
                )}
              </button>
            ) : (
              <div className="mt-8 space-y-6 animate-fade-in">


                <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/20">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                      {formatLabel(topResult.label)}
                    </h4>
                    <p className="text-lg text-primary font-semibold">
                      {(topResult.score * 100).toFixed(1)}% Confidence
                    </p>
                  </div>
                </div>

                <button
                  onClick={removeImage}
                  className="w-full mt-2 py-3 text-slate-500 hover:text-primary font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Try Another Image
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="mt-20 text-center text-slate-400 text-sm font-medium animate-fade-in [animation-delay:400ms]">
        <p>&copy; {new Date().getFullYear()} FloraScan AI. Protecting your garden one leaf at a time.</p>
      </footer>
    </main>
  );
}
