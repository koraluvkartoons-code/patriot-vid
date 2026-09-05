import { useEffect, useState } from "react";
import { MonitorCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const DESIGNS = [
  { id: "", label: "DEFAULT" },
  { id: "y2k", label: "Y2K CYBER" },
  { id: "pc98", label: "PC-98 AMBER" },
  { id: "pastel", label: "PASTEL POP" },
] as const;

const KEY = "system-design";

export default function DesignSwitcher({ className }: { className?: string }) {
  const [design, setDesign] = useState<string>(() => {
    try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (design) root.setAttribute("data-design", design);
    else root.removeAttribute("data-design");
    try {
      if (design) localStorage.setItem(KEY, design);
      else localStorage.removeItem(KEY);
    } catch { /* ignore */ }
  }, [design]);

  const current = DESIGNS.find(d => d.id === design) ?? DESIGNS[0];

  return (
    <>
      {design && <div className="design-overlay" aria-hidden />}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost" className={className ?? "h-7 px-2 text-[11px] text-foreground hover:text-primary"} aria-label="Change system design">
            <MonitorCog className="w-3 h-3 mr-1" />SYSTEM DESIGN
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-2 space-y-1">
          <p className="text-[10px] text-muted-foreground px-1">// SYSTEM DESIGN: {current.label}</p>
          {DESIGNS.map(d => (
            <button
              key={d.id || "default"}
              onClick={() => setDesign(d.id)}
              className={`w-full text-left text-[11px] px-2 py-1 border rounded-sm ${design === d.id ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-primary"}`}
            >{d.label}</button>
          ))}
        </PopoverContent>
      </Popover>
    </>
  );
}
