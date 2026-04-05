import { useEffect, useRef } from "react";

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  label: string;
}

interface HeatmapOverlayProps {
  imageSrc: string;
  regions: Region[];
}

export const HeatmapOverlay = ({ imageSrc, regions }: HeatmapOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !regions.length) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Draw heatmap regions
      regions.forEach((region) => {
        const rx = (region.x / 100) * img.width;
        const ry = (region.y / 100) * img.height;
        const rw = (region.width / 100) * img.width;
        const rh = (region.height / 100) * img.height;

        // Radial gradient for heatmap effect
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        const radius = Math.max(rw, rh);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(255, 0, 0, ${region.intensity * 0.7})`);
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${region.intensity * 0.5})`);
        gradient.addColorStop(0.7, `rgba(255, 200, 0, ${region.intensity * 0.3})`);
        gradient.addColorStop(1, "rgba(255, 255, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(rx - radius / 2, ry - radius / 2, radius * 2, radius * 2);

        // Draw label
        ctx.save();
        ctx.font = `bold ${Math.max(12, img.width / 40)}px Inter, sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeText(region.label, rx, ry - 8);
        ctx.fillText(region.label, rx, ry - 8);
        ctx.restore();

        // Draw border
        ctx.strokeStyle = `rgba(255, 80, 80, ${region.intensity})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);
      });
    };
    img.src = imageSrc;
  }, [imageSrc, regions]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-lg"
    />
  );
};
