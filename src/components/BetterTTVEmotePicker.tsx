import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { BETTER_TTV_EMOTES, type BetterTTVEmote } from "@/lib/bttvEmotes";
import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (emote: BetterTTVEmote) => void;
  onClose: () => void;
}

export default function BetterTTVEmotePicker({ onSelect, onClose }: Props) {
  const [group, setGroup] = useState<"popular" | "mario">("popular");
  const [query, setQuery] = useState("");
  const emotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return BETTER_TTV_EMOTES.filter(emote =>
      emote.group === group && (!normalized || emote.code.toLowerCase().includes(normalized))
    );
  }, [group, query]);

  return (
    <div className="bttv-picker" role="dialog" aria-label="BetterTTV emote picker">
      <div className="flex items-center gap-1">
        <Button type="button" size="sm" variant={group === "popular" ? "default" : "ghost"} className="h-7 px-2 text-[10px]" onClick={() => setGroup("popular")}>POPULAR</Button>
        <Button type="button" size="sm" variant={group === "mario" ? "default" : "ghost"} className="h-7 px-2 text-[10px]" onClick={() => setGroup("mario")}>MARIO</Button>
        <div className="flex-1" />
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={onClose} aria-label="Close emote picker"><X className="h-3.5 w-3.5" /></Button>
      </div>
      <label className="bttv-search">
        <Search className="h-3.5 w-3.5" aria-hidden />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search emotes" aria-label="Search BetterTTV emotes" />
      </label>
      <div className="bttv-grid">
        {emotes.map(emote => (
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
      </div>
    </div>
  );
}