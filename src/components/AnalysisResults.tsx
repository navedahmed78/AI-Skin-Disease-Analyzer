import { HeatmapOverlay } from "./HeatmapOverlay";
import { Activity, AlertTriangle, CheckCircle, FileText, Download, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface AnalysisResultsProps {
  result: AnalysisResult;
  originalImage: string;
}

export const AnalysisResults = ({ result, originalImage }: AnalysisResultsProps) => {
  const confidencePercent = Math.round(result.confidence * 100);

  const severityConfig = {
    normal: { color: "text-success", bg: "bg-success/10", border: "border-success/30", icon: CheckCircle },
    mild: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", icon: AlertTriangle },
    moderate: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", icon: AlertTriangle },
    severe: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: AlertTriangle },
  };

  const sev = severityConfig[result.severity as keyof typeof severityConfig] || severityConfig.moderate;
  const SeverityIcon = sev.icon;

  const handleDownloadReport = () => {
    const report = `
MEDICAL IMAGE ANALYSIS REPORT
${"=".repeat(50)}
Date: ${new Date().toLocaleString()}

DIAGNOSIS: ${result.disease}
Confidence: ${confidencePercent}%
Severity: ${result.severity.toUpperCase()}

FINDINGS:
${result.findings.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}

EXPLANATION:
${result.explanation}

RECOMMENDATIONS:
${result.recommendations.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}

${"=".repeat(50)}
DISCLAIMER: This is an AI-generated analysis for educational purposes only.
Always consult a qualified medical professional for diagnosis.
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Diagnosis Header */}
      <div className={`rounded-xl border ${sev.border} ${sev.bg} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <SeverityIcon className={`w-8 h-8 ${sev.color}`} />
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">{result.disease}</h3>
              <p className={`text-sm font-medium ${sev.color} capitalize`}>{result.severity} severity</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-foreground">{confidencePercent}%</div>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
        </div>
        {/* Confidence bar */}
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-1000"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h4 className="font-display font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Original Image
          </h4>
          <img src={originalImage} alt="Original scan" className="w-full rounded-lg object-contain max-h-64 bg-black/30" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h4 className="font-display font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-destructive" /> Heatmap Analysis
          </h4>
          {result.affectedRegions.length > 0 ? (
            <div className="max-h-64 overflow-hidden rounded-lg">
              <HeatmapOverlay imageSrc={originalImage} regions={result.affectedRegions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-lg bg-secondary/30">
              <p className="text-muted-foreground text-sm">No abnormal regions detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Findings */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Key Findings
        </h4>
        <ul className="space-y-2">
          {result.findings.map((finding, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-secondary-foreground">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {finding}
            </li>
          ))}
        </ul>
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h4 className="font-display font-semibold text-foreground mb-3">AI Explanation</h4>
        <p className="text-secondary-foreground text-sm leading-relaxed">{result.explanation}</p>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h4 className="font-display font-semibold text-foreground mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
              <span className="text-primary mt-0.5">→</span> {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Download */}
      <Button variant="glow" className="w-full" onClick={handleDownloadReport}>
        <Download className="w-4 h-4 mr-2" /> Download Report
      </Button>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        ⚠️ This AI analysis is for educational purposes only. Always consult a qualified medical professional.
      </p>
    </div>
  );
};
