import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { applyThemeColor, getStoredThemeColor, storeThemeColor, THEME_PRESETS, type ThemeScope } from "@/lib/theme";

export default function ThemeColorPicker({ scope, className }: { scope: ThemeScope; className?: string }) {
  const [color, setColor] = useState<string | null>(() => getStoredThemeColor(scope));

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
        <p className="text-[11px] text-muted-foreground">Site color</p>
        <div className="grid grid-cols-3 gap-1">
          {THEME_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => pick(p.hex)}
              className={`h-8 rounded-sm border text-[9px] leading-tight px-1 ${color === p.hex ? "border-primary" : "border-border"}`}
              style={p.hex === "rainbow" ? { background: "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)", color: "#fff", textShadow: "0 0 4px #000" } : p.hex ? { background: p.hex, color: "#111" } : undefined}
            >{p.label}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[11px]">
          <input
            type="color"
            value={color && color !== "rainbow" ? color : "#1a0b1f"}
            onChange={e => pick(e.target.value)}
            className="h-8 w-10 bg-transparent border border-border rounded-sm cursor-pointer"
            aria-label="Pick any color"
          />
          Any color
        </label>
        <button onClick={() => pick(null)} className="w-full text-[11px] border border-border rounded-sm py-1 text-muted-foreground hover:text-primary">Reset</button>
      </PopoverContent>
    </Popover>
  );
}
