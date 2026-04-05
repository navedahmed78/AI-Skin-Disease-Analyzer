import { Brain } from "lucide-react";

export const LoadingAnalysis = () => {
  return (
    <div className="rounded-xl border border-primary/30 bg-card p-8 shadow-card animate-pulse-glow">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-display text-lg font-semibold text-foreground">Analyzing Image</h3>
          <p className="text-sm text-muted-foreground">AI is processing your medical scan…</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          {["Loading neural network", "Scanning image features", "Generating diagnosis"].map((step, i) => (
            <div key={step} className="flex items-center gap-3" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              <span className="text-xs text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
