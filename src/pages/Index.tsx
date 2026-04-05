import { useState, useCallback } from "react";
import { Scan, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AnalysisHistory, type HistoryItem } from "@/components/AnalysisHistory";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  disease: string;
  confidence: number;
  severity: string;
  findings: string[];
  affectedRegions: Array<{
    x: number; y: number; width: number; height: number; intensity: number; label: string;
  }>;
  explanation: string;
  recommendations: string[];
}

const Index = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const handleImageSelect = useCallback((file: File, preview: string, base64: string) => {
    setImagePreview(preview);
    setImageBase64(base64);
    setImageType(file.type || "image/jpeg");
    setResult(null);
  }, []);

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64, imageType },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          disease: data.disease,
          confidence: data.confidence,
          severity: data.severity,
          timestamp: new Date(),
          thumbnail: imagePreview!,
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast({
        title: "Analysis Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Scan className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">MedVision AI</h1>
              <p className="text-xs text-muted-foreground">Visual Diagnosis System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>AI-Powered Analysis</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        {!result && !isAnalyzing && (
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-primary">AI-Powered</span>{" "}
              <span className="text-foreground">Medical Imaging</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload medical scans for instant AI analysis with visual heatmaps,
              disease detection, and detailed diagnostic explanations.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              {[
                { icon: Zap, label: "Instant Analysis" },
                { icon: Scan, label: "Heatmap Overlay" },
                { icon: Shield, label: "Educational Tool" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <ImageUploader onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />

            {imagePreview && !isAnalyzing && !result && (
              <Button variant="glow" size="lg" className="w-full" onClick={handleAnalyze}>
                <Scan className="w-5 h-5 mr-2" /> Analyze with AI
              </Button>
            )}

            {isAnalyzing && <LoadingAnalysis />}

            {result && imagePreview && (
              <AnalysisResults result={result} originalImage={imagePreview} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AnalysisHistory
              history={history}
              onSelect={(item) => {
                setImagePreview(item.thumbnail);
                // Show basic info from history
              }}
            />

            {/* Info Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-3">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Upload a medical image (X-ray, MRI, CT)" },
                  { step: "2", text: "AI analyzes patterns and anomalies" },
                  { step: "3", text: "View heatmap, diagnosis, and explanation" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {step}
                    </span>
                    <p className="text-sm text-secondary-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported Types */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-3">Supported Scans</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Chest X-ray", "Brain MRI", "CT Scan", "Bone X-ray", "Mammogram", "Retinal Scan"].map((type) => (
                  <div key={type} className="px-3 py-2 rounded-lg bg-secondary/50 text-sm text-secondary-foreground text-center">
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
