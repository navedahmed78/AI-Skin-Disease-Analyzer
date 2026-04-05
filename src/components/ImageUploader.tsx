import { useCallback, useState } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string, base64: string) => void;
  isAnalyzing: boolean;
}

export const ImageUploader = ({ onImageSelect, isAnalyzing }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      const base64 = result.split(",")[1];
      onImageSelect(file, result, base64);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearImage = () => {
    setPreview(null);
    setFileName("");
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group ${
            isDragging
              ? "border-primary bg-primary/5 glow-primary"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-foreground font-display font-semibold text-lg">
                Upload Medical Image
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                X-ray, MRI, CT Scan — Drag & drop or click to browse
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {["DICOM", "PNG", "JPG", "TIFF"].map((fmt) => (
                <span key={fmt} className="px-2 py-1 rounded-md bg-secondary text-muted-foreground text-xs font-mono">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border shadow-card">
          <img src={preview} alt="Medical scan preview" className="w-full max-h-80 object-contain bg-black/50" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={clearImage} disabled={isAnalyzing}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 text-sm">
              <FileImage className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium truncate">{fileName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
