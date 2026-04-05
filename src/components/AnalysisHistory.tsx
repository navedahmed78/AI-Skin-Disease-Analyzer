import { Clock, ChevronRight } from "lucide-react";

export interface HistoryItem {
  id: string;
  disease: string;
  confidence: number;
  severity: string;
  timestamp: Date;
  thumbnail: string;
}

interface AnalysisHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const AnalysisHistory = ({ history, onSelect }: AnalysisHistoryProps) => {
  if (!history.length) return null;

  const severityColors: Record<string, string> = {
    normal: "bg-success/20 text-success",
    mild: "bg-warning/20 text-warning",
    moderate: "bg-warning/20 text-warning",
    severe: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" /> Analysis History
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors text-left group"
          >
            <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover bg-black/30" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{item.disease}</p>
              <p className="text-xs text-muted-foreground">
                {item.timestamp.toLocaleDateString()} · {Math.round(item.confidence * 100)}% confidence
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${severityColors[item.severity] || severityColors.moderate}`}>
              {item.severity}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
