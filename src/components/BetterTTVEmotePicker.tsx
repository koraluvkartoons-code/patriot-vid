import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { BETTER_TTV_EMOTES, BETTER_TTV_GROUPS, type BetterTTVEmote, type BetterTTVGroup } from "@/lib/bttvEmotes";
import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (emote: BetterTTVEmote) => void;
  onClose: () => void;
}

const STEP = 120;

export default function BetterTTVEmotePicker({ onSelect, onClose }: Props) {
  const [group, setGroup] = useState<BetterTTVGroup | "all">("popular");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(STEP);
  const emotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return BETTER_TTV_EMOTES.filter(emote =>
      (group === "all" || emote.group === group) && (!normalized || emote.code.toLowerCase().includes(normalized))
    );
  }, [group, query]);

  const pick = (g: BetterTTVGroup | "all") => { setGroup(g); setLimit(STEP); };

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
        <input value={query} onChange={event => { setQuery(event.target.value); setLimit(STEP); }} placeholder={`Search ${emotes.length} emotes`} aria-label="Search BetterTTV emotes" />
      </label>
      <div className="bttv-grid">
        {emotes.slice(0, limit).map(emote => (
          <Button
            key={emote.id}
            type="button"
            variant="ghost"
            className="bttv-emote"
            title={emote.code}
            aria-label={`Add ${emote.code} emote`}
            onClick={() => onSelect(emote)}
          >
            <img src={emote.url} alt={emote.code} loading="lazy" decoding="async" />
            <span>{emote.code}</span>
          </Button>
        ))}
        {emotes.length > limit && (
          <Button type="button" variant="ghost" className="col-span-full h-8 text-[10px]" onClick={() => setLimit(l => l + STEP)}>SHOW MORE ({emotes.length - limit})</Button>
        )}
      </div>
    </div>
  );
}
