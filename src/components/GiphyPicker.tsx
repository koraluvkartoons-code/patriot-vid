import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const API_KEY = "STISYuQRFlvhpSNN8Uup0TxXf5u54c8d";

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function GiphyPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);

  useEffect(() => {
    const url = query.trim()
      ? `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=pg-13`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=20&rating=pg-13`;
    fetch(url).then(r => r.json()).then(d => setGifs(d.data || [])).catch(() => {});
  }, [query]);

  return (
    <div className="gradient-card border border-border rounded-lg p-3 w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground text-sm font-semibold">GIFs</span>
        <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="pl-8 bg-muted border-border text-foreground text-sm h-8"
        />
      </div>
      <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto scrollbar-hide">
        {gifs.map((g: any) => (
          <img
            key={g.id}
            src={g.images?.fixed_height_small?.url}
            alt={g.title}
            className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSelect(g.images?.original?.url)}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 text-right">Powered by GIPHY</p>
    </div>
  );
}
