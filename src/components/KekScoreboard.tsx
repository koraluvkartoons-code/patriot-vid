import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/store";
import { COUNTRIES, countryFlag, rankKekScores, type KekScore } from "@/lib/kekScoreboard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

export default function KekScoreboard({ refreshKey, site = "kak" }: { refreshKey: unknown; site?: "kak" | "yfere" }) {
  const label = site === "yfere" ? "YFERE" : "KEK";
  const [rows, setRows] = useState<KekScore[]>([]);
  const [country, setCountry] = useState("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const username = getCurrentUserId();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.rpc(site === "yfere" ? "yfere_post_scoreboard" : "kek_post_scoreboard");
    if (fetchError) setError("Scoreboard could not load. Try again.");
    else {
      setError("");
      setRows(rankKekScores((data || []).map(row => ({ username: row.username, posts: Number(row.posts), countryCode: row.country_code }))));
    }
    if (username) {
      const { data: profile } = await supabase.from("profiles").select("kek_country_code").eq("display_name", username).maybeSingle();
      setCountry(profile?.kek_country_code || "none");
    }
    setLoading(false);
  }, [username, site]);

  useEffect(() => { void load(); }, [load, refreshKey]);
  useEffect(() => {
    const timer = window.setInterval(() => { void load(); }, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const saveCountry = async (value: string) => {
    if (!username || saving) return;
    setSaving(true);
    setError("");
    const code = value === "none" ? null : value;
    const { data, error: saveError } = await supabase.from("profiles").update({ kek_country_code: code })
      .eq("display_name", username).select("display_name");
    if (saveError || !data?.length) setError("Your flag could not be saved. Create your profile on PoliAniGames first.");
    else {
      setCountry(value);
      setRows(previous => previous.map(row => row.username === username ? { ...row, countryCode: code } : row));
    }
    setSaving(false);
  };

  return (
    <section id={`${label.toLowerCase()}-scoreboard`} aria-label={`${label} scoreboard`} className="kek-scoreboard border-t px-3 py-3 text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">[{label} SCOREBOARD]</h2>
        <Button type="button" size="icon" variant="ghost" className="kek-control h-7 w-7" aria-label={`Refresh ${label} scoreboard`} onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {username && <div className="flex flex-wrap items-center gap-2">
        <label id={`${label}-country-label`} className="break-all">{username} · FLAG</label>
        <Select value={country} onValueChange={value => void saveCountry(value)} disabled={saving}>
          <SelectTrigger aria-labelledby={`${label}-country-label`} className="kek-control w-[210px] max-w-full h-8"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="none">🏳️ No flag</SelectItem>
            {COUNTRIES.map(item => <SelectItem key={item.code} value={item.code}>{countryFlag(item.code)} {item.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>}
      {error && <p role="alert">{error}</p>}
      {loading && rows.length === 0 ? <p>Loading scores…</p> : <>
        <div className="grid grid-cols-[2rem_minmax(0,1fr)_4rem] gap-2 font-bold opacity-70"><span>#</span><span>USERNAME</span><span className="text-right">POSTS</span></div>
        <ol className="max-h-64 overflow-y-auto space-y-2">
          {rows.map((row, index) => <li key={row.username} className="grid grid-cols-[2rem_minmax(0,1fr)_4rem] items-start gap-2">
            <span>{index + 1}</span><span className="min-w-0 break-words"><span className="kek-flag mr-2" aria-label={row.countryCode || "No country flag"}>{countryFlag(row.countryCode)}</span>{row.username}</span><span className="text-right tabular-nums">{row.posts}</span>
          </li>)}
        </ol>
        {rows.length === 0 && <p>No posts yet.</p>}
      </>}
    </section>
  );
}