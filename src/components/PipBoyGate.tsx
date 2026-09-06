import { useEffect, useState, type ReactNode } from "react";

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

function VaultBoy({ pose }: { pose: "arms" | "thumbs" }) {
  return (
    <svg viewBox="0 0 120 150" className="vb-fig" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="60" cy="28" r="20" />
        <path d="M50 24c3-3 7-3 9 0M61 24c3-3 7-3 9 0" />
        <path d="M52 36c5 4 12 4 17 0" />
        <path d="M60 48v52" />
        {pose === "arms" ? (
          <>
            <path d="M60 60L26 40M60 60l34-20" />
            <path d="M26 40l-8-4M94 40l8-4" />
          </>
        ) : (
          <>
            <path d="M60 60L30 74M60 60l30-24" />
            <path d="M90 36l2-10M30 74l-9 3" />
          </>
        )}
        <path d="M60 100l-18 34M60 100l18 34" />
        <path d="M42 134h-9M78 134h9" />
      </g>
    </svg>
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
            <VaultBoy pose="arms" />
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
          <VaultBoy pose="thumbs" />
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
