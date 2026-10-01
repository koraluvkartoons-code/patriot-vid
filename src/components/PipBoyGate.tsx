import { useEffect, useState, type ReactNode } from "react";
import vaultBoyAsset from "@/assets/vaultboy.png.asset.json";

function useDesign() {
  const [design, setDesign] = useState<string>(() =>
    typeof document !== "undefined" ? document.documentElement.getAttribute("data-design") || "" : ""
  );
  useEffect(() => {
    const root = document.documentElement;
    setDesign(root.getAttribute("data-design") || "");
    const mo = new MutationObserver(() => setDesign(root.getAttribute("data-design") || ""));
    mo.observe(root, { attributes: true, attributeFilter: ["data-design"] });
    return () => mo.disconnect();
  }, []);
  return design;
}

const CODE = "1984";

function VaultBoy() {
  return (
    <img src={vaultBoyAsset.url} className="vb-fig vb-img" alt="Vault Boy giving a thumbs up" />
  );
}

export default function PipBoyGate({ children }: { children: ReactNode }) {
  const design = useDesign();
  const [unlocked, setUnlocked] = useState(false);
  const [keypad, setKeypad] = useState(false);
  const [entry, setEntry] = useState("");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (design !== "pipboy") {
      setUnlocked(false);
      setKeypad(false);
      setEntry("");
      setDenied(false);
    }
  }, [design]);

  if (design !== "pipboy" || unlocked) return <>{children}</>;

  const submit = () => {
    if (entry === CODE) {
      setDenied(false);
      setUnlocked(true);
    } else {
      setDenied(true);
      setEntry("");
    }
  };

  return (
    <div className="vb-gate">
      <p className="vb-head">// VAULT-TEC PIP-BOY 3000 — FEED LOCKED</p>

      {!keypad ? (
        <>
          <button type="button" className="vb-boy" onClick={() => setKeypad(true)} aria-label="Enter access code">
            <VaultBoy />
            <span className="vb-caption">TAP VAULT BOY → ENTER CODE</span>
          </button>
          <div className="vb-buttons">
            {["STATS", "ITEMS", "DATA"].map(b => (
              <button key={b} type="button" className="vb-btn" onClick={() => setUnlocked(true)}>{b}</button>
            ))}
          </div>
          <p className="vb-hint">PRESS A BUTTON TO OPEN THE FEED</p>
        </>
      ) : (
        <div className="vb-keypad">
          <VaultBoy />
          <p className="vb-caption">ENTER ACCESS CODE</p>
          <p className="vb-code">{(entry + "____").slice(0, 4).split("").join(" ")}</p>
          {denied && <p className="vb-denied">ACCESS DENIED — RETRY</p>}
          <div className="vb-pad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "OK"].map(k => (
              <button
                key={k}
                type="button"
                className="vb-key"
                onClick={() => {
                  if (k === "CLR") { setEntry(""); setDenied(false); }
                  else if (k === "OK") submit();
                  else if (entry.length < 4) setEntry(e => e + k);
                }}
              >{k}</button>
            ))}
          </div>
          <button type="button" className="vb-back" onClick={() => { setKeypad(false); setEntry(""); setDenied(false); }}>← BACK</button>
        </div>
      )}
    </div>
  );
}                
