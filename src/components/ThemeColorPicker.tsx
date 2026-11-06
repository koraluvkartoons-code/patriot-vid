import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { applyThemeColor, applyXPostColor, getStoredXPostColor, storeXPostColor, getStoredThemeColor, storeThemeColor, THEME_PRESETS, type ThemeScope } from "@/lib/theme";

export default function ThemeColorPicker({ scope, className }: { scope: ThemeScope; className?: string }) {
  const [color, setColor] = useState<string | null>(() => getStoredThemeColor(scope));
  const [postColor, setPostColor] = useState(getStoredXPostColor);
  const [isX, setIsX] = useState(() => scope === "byteticker" && document.documentElement.dataset.design === "x");

  useEffect(() => {
    const update = () => setIsX(scope === "byteticker" && document.documentElement.dataset.design === "x");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-design"] });
    return () => observer.disconnect();
  }, [scope]);

  useEffect(() => {
    applyXPostColor(isX ? postColor : null);
    return () => applyXPostColor(null);
  }, [isX, postColor]);

  useEffect(() => {
    applyThemeColor(color);
    return () => applyThemeColor(null);
  }, [color]);

  const pick = (hex: string | null) => {
    setColor(hex);
    storeThemeColor(scope, hex);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className={className ?? "h-7 px-2 text-[11px] text-foreground hover:text-primary"} aria-label="Change site color">
          <Palette className="w-3 h-3 mr-1" />COLOR
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3 space-y-3">
        <p className="text-[11px] text-muted-foreground">{isX ? "Background" : "Site color"}</p>
        <div className="grid grid-cols-3 gap-1">
          {THEME_PRESETS.map(p => (
            <Button
              key={p.label}
              type="button"
              variant="outline"
              onClick={() => pick(p.hex)}
              className={`h-8 rounded-sm border text-[9px] leading-tight px-1 ${color === p.hex ? "border-primary" : "border-border"}`}
              style={p.hex ? { background: p.hex, color: "#111" } : undefined}
            >{p.label}</Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[11px]">
          <input
            type="color"
            value={color ?? "#1a0b1f"}
            onChange={e => pick(e.target.value)}
            className="h-8 w-10 bg-transparent border border-border rounded-sm cursor-pointer"
            aria-label={isX ? "Pick background color" : "Pick any color"}
          />
          Any color
        </label>
        {isX && (
          <label className="flex items-center gap-2 text-[11px] border-t border-border pt-3">
            <input type="color" value={postColor ?? color ?? "#000000"} onChange={e => {
              setPostColor(e.target.value);
              storeXPostColor(e.target.value);
            }} className="h-8 w-10 bg-transparent border border-border rounded-sm cursor-pointer" aria-label="Pick post color" />
            Posts
          </label>
        )}
        <Button type="button" variant="outline" onClick={() => {
          pick(null);
          if (isX) { setPostColor(null); storeXPostColor(null); }
        }} className="w-full h-7 text-[11px] text-muted-foreground hover:text-primary">Reset</Button>
      </PopoverContent>
    </Popover>
  );
}
