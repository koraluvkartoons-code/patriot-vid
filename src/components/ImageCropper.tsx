import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  file: File;
  src: string;
  onCancel: () => void;
  onCropped: (file: File, preview: string) => void;
}

type Area = { x: number; y: number; width: number; height: number };

const RATIOS: { label: string; value: number | undefined }[] = [
  { label: "FREE", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
];

async function cropToFile(src: string, area: Area, file: File): Promise<{ file: File; url: string }> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  const isPng = file.type === "image/png";
  const mime = isPng ? "image/png" : "image/jpeg";
  const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), mime, 0.95));
  const name = file.name.replace(/\.\w+$/, "") + (isPng ? "-crop.png" : "-crop.jpg");
  return { file: new File([blob], name, { type: mime }), url: URL.createObjectURL(blob) };
}

export default function ImageCropper({ file, src, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const out = await cropToFile(src, area, file);
      onCropped(out.file, out.url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader><DialogTitle className="text-primary text-sm">// CROP_PHOTO</DialogTitle></DialogHeader>
        <div className="relative w-full h-64 bg-black rounded-sm overflow-hidden">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap text-[11px]">
          {RATIOS.map(r => (
            <button
              key={r.label}
              onClick={() => setAspect(r.value)}
              className={`px-2 py-1 border rounded-sm ${aspect === r.value ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"}`}
            >[ {r.label} ]</button>
          ))}
        </div>
        <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-primary" aria-label="Zoom" />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} className="text-muted-foreground">Cancel</Button>
          <Button size="sm" onClick={apply} disabled={busy || !area} className="gradient-btn">{busy ? "Cropping..." : "Apply crop"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
