"use client";

import React, { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";
import { NeuButton } from "./NeuComponents";
import { RotateCcw } from "lucide-react";

interface NeuSignaturePadProps {
  label?: string;
  isRequired?: boolean;
  onChange: (dataUrl: string | null) => void;
  value?: string | null;
}

export const NeuSignaturePad: React.FC<NeuSignaturePadProps> = ({
  label = "Tanda Tangan Digital",
  isRequired = false,
  onChange,
  value,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(!value);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    // Sesuaikan resolusi canvas dengan bounding client rect
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);

      if (signaturePadRef.current && value) {
        signaturePadRef.current.fromDataURL(value);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const pad = new SignaturePad(canvas, {
      backgroundColor: "rgba(0,0,0,0)",
      penColor: "#0D2538", // Tinta biru-tua formal
      minWidth: 1.2,
      maxWidth: 2.8,
    });

    pad.addEventListener("endStroke", () => {
      setIsEmpty(pad.isEmpty());
      if (!pad.isEmpty()) {
        onChange(pad.toDataURL("image/png"));
      } else {
        onChange(null);
      }
    });

    signaturePadRef.current = pad;

    if (value) {
      pad.fromDataURL(value);
      setIsEmpty(false);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      pad.off();
    };
  }, []);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
      onChange(null);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        {!isEmpty && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ulangi Tanda Tangan
          </button>
        )}
      </div>

      <div className="neu-inset p-3 relative bg-[#E8EDF2] rounded-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair rounded-xl"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-xs text-[#A0AEC0] gap-1.5">
            ✍️ Bubuhkan tanda tangan di sini (Sentuhan Layar / Mouse)
          </div>
        )}
      </div>
    </div>
  );
};
