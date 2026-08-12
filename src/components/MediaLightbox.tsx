import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Item { url: string; type?: string }

interface Props {
  items: Item[];
  index: number;
  onClose: () => void;
}

export default function MediaLightbox({ items, index, onClose }: Props) {
  const [i, setI] = useState(index);

  useEffect(() => setI(index), [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI(v => (v + 1) % items.length);
      if (e.key === "ArrowLeft") setI(v => (v - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [items.length, onClose]);

  if (!items.length) return null;
  const cur = items[i];

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-foreground hover:text-primary z-10">
        <X className="w-6 h-6" />
      </button>
      {items.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={e => { e.stopPropagation(); setI(v => (v - 1 + items.length) % items.length); }}
            className="absolute left-2 text-foreground hover:text-primary z-10"
          ><ChevronLeft className="w-8 h-8" /></button>
          <button
            aria-label="Next"
            onClick={e => { e.stopPropagation(); setI(v => (v + 1) % items.length); }}
            className="absolute right-2 text-foreground hover:text-primary z-10"
          ><ChevronRight className="w-8 h-8" /></button>
        </>
      )}
      <div className="max-w-[92vw] max-h-[88vh]" onClick={e => e.stopPropagation()}>
        {cur.type === "video" ? (
          <video src={cur.url} controls autoPlay className="max-w-[92vw] max-h-[88vh]" />
        ) : (
          <img src={cur.url} alt="" className="max-w-[92vw] max-h-[88vh] object-contain" />
        )}
      </div>
      {items.length > 1 && (
        <span className="absolute bottom-3 text-[12px] text-muted-foreground">{i + 1} / {items.length}</span>
      )}
    </div>
  );
}
