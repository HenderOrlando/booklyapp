/**
 * TrendChart - Gráfico de líneas simple para mostrar tendencias
 *
 * Componente lightweight para visualizar datos de series de tiempo
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import * as React from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  showGrid?: boolean;
  height?: number;
}

export function TrendChart({
  title,
  data,
  color = "var(--color-action-primary)",
  showGrid = true,
  height = 200,
}: TrendChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to resolve CSS variable
    const getVar = (v: string) => {
      if (v.startsWith("var(")) {
        const varName = v.match(/var\(([^)]+)\)/)?.[1];
        if (varName) {
          return getComputedStyle(canvas).getPropertyValue(varName).trim();
        }
      }
      return v;
    };

    const resolvedColor = getVar(color);
    const gridColor = getVar("var(--color-border-subtle)");
    const labelColor = getVar("var(--color-text-tertiary)");

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const chartHeight = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, chartHeight);

    // Calculate scales
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const valueRange = maxValue - minValue || 1;

    const xStep = (width - padding * 2) / (data.length - 1 || 1);
    const yScale = (chartHeight - padding * 2) / valueRange;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor || "#374151";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight - padding * 2) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Draw line
    ctx.strokeStyle = resolvedColor || color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + i * xStep;
      const y = chartHeight - padding - (point.value - minValue) * yScale;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = resolvedColor || color;
    data.forEach((point, i) => {
      const x = padding + i * xStep;
      const y = chartHeight - padding - (point.value - minValue) * yScale;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = labelColor || "#9ca3af";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";

    // X-axis labels (show every nth label to avoid overlap)
    const labelStep = Math.ceil(data.length / 6);
    data.forEach((point, i) => {
      if (i % labelStep === 0 || i === data.length - 1) {
        const x = padding + i * xStep;
        ctx.fillText(point.label, x, chartHeight - 10);
      }
    });

    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (valueRange * i) / 4;
      const y = chartHeight - padding - (chartHeight - padding * 2) * (i / 4);
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
  }, [data, color, showGrid]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: `${height}px` }}
          className="cursor-crosshair"
        />
      </CardContent>
    </Card>
  );
}
