"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function CustomSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}: CustomSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const percentage = ((value[0] - min) / (max - min)) * 100;

  const updateValue = React.useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      onValueChange([clampedValue]);
    },
    [min, max, step, onValueChange, disabled]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updateValue]);

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-5 w-full cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-primary shadow-sm transition-shadow",
          isDragging && "ring-4 ring-primary/20",
          !disabled && "hover:ring-4 hover:ring-primary/20"
        )}
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}
