import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  index: number;
  onClose: () => void;
}

export default function Lightbox({ images, index, onClose }: Props) {
  const [i, setI] = useState(index);
  const touchX = useRef<number | null>(null);

  useEffect(() => setI(index), [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI(v => Math.min(v + 1, images.length - 1));
      if (e.key === "ArrowLeft") setI(v => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [images.length, onClose]);

  if (!images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 45) {
          if (dx < 0) setI(v => Math.min(v + 1, images.length - 1));
          else setI(v => Math.max(v - 1, 0));
        }
        touchX.current = null;
      }}
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white z-10" aria-label="Close">
        <X className="w-6 h-6" />
      </button>

      {i > 0 && (
        <button
          onClick={e => { e.stopPropagation(); setI(v => v - 1); }}
          className="absolute left-2 text-white/70 hover:text-white z-10" aria-label="Previous photo"
        ><ChevronLeft className="w-8 h-8" /></button>
      )}
      {i < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); setI(v => v + 1); }}
          className="absolute right-2 text-white/70 hover:text-white z-10" aria-label="Next photo"
        ><ChevronRight className="w-8 h-8" /></button>
      )}

      <img
        src={images[i]}
        alt={`Photo ${i + 1} of ${images.length}`}
        onClick={e => e.stopPropagation()}
        className="max-h-[92vh] max-w-[95vw] object-contain select-none"
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5">
          {images.map((_, n) => (
            <button
              key={n}
              onClick={e => { e.stopPropagation(); setI(n); }}
              aria-label={`Go to photo ${n + 1}`}
              className={`w-1.5 h-1.5 rounded-full ${n === i ? "bg-primary" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
