import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { BETTER_TTV_EMOTES, BETTER_TTV_GROUPS, type BetterTTVEmote, type BetterTTVGroup } from "@/lib/bttvEmotes";
import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (emote: BetterTTVEmote) => void;
  onClose: () => void;
}

const ROW_HEIGHT = 68;
const GROUP_EMOTES = new Map<BetterTTVGroup, BetterTTVEmote[]>();
for (const emote of BETTER_TTV_EMOTES) {
  const entries = GROUP_EMOTES.get(emote.group) ?? [];
  entries.push(emote);
  GROUP_EMOTES.set(emote.group, entries);
}

export default function BetterTTVEmotePicker({ onSelect, onClose }: Props) {
  const [group, setGroup] = useState<BetterTTVGroup | "all">("popular");
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [columns, setColumns] = useState(5);
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => setColumns(getComputedStyle(grid).gridTemplateColumns.split(" ").length);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);
  const emotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const entries = group === "all" ? BETTER_TTV_EMOTES : GROUP_EMOTES.get(group) ?? [];
    return normalized ? entries.filter(emote => emote.code.toLowerCase().includes(normalized)) : entries;
  }, [group, query]);

  const resetScroll = () => { setScrollTop(0); gridRef.current?.scrollTo(0, 0); };
  const pick = (g: BetterTTVGroup | "all") => { setGroup(g); resetScroll(); };
  const rows = Math.ceil(emotes.length / columns);
  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
  const endRow = Math.min(rows, startRow + 9);

  return (
    <div className="bttv-picker" role="dialog" aria-label="BetterTTV emote picker">
      <div className="flex items-center gap-1 flex-wrap">
        {(["all", ...BETTER_TTV_GROUPS] as const).map(g => (
          <Button key={g} type="button" size="sm" variant={group === g ? "default" : "ghost"} className="h-7 px-2 text-[10px] uppercase" onClick={() => pick(g)}>{g}</Button>
        ))}
        <div className="flex-1" />
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={onClose} aria-label="Close emote picker"><X className="h-3.5 w-3.5" /></Button>
      </div>
      <label className="bttv-search">
        <Search className="h-3.5 w-3.5" aria-hidden />
        <input value={query} onChange={event => { setQuery(event.target.value); resetScroll(); }} placeholder={`Search ${emotes.length} emotes`} aria-label="Search BetterTTV emotes" />
      </label>
      <div className="bttv-grid" ref={gridRef} onScroll={event => setScrollTop(event.currentTarget.scrollTop)}>
        {startRow > 0 && <div aria-hidden className="col-span-full" style={{ height: startRow * ROW_HEIGHT - 4 }} />}
        {emotes.slice(startRow * columns, endRow * columns).map(emote => (
          <Button
            key={emote.id}
            type="button"
            variant="ghost"
            className="bttv-emote"
            title={emote.code}
            aria-label={`Add ${emote.code} emote`}
            onClick={() => onSelect(emote)}
          >
            <img src={emote.url} alt={emote.code} width={38} height={38} loading="eager" decoding="async" />
            <span>{emote.code}</span>
          </Button>
        ))}
        {endRow < rows && <div aria-hidden className="col-span-full" style={{ height: (rows - endRow) * ROW_HEIGHT - 4 }} />}
      </div>
    </div>
  );
}
