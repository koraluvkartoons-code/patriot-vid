import { useState } from "react";
import vaultBoy from "@/assets/140272-pip-boy-fallout-free-hd-image.png";

type Pose = "arms" | "thumbs";

interface PipBoyGateProps {
  onUnlock: () => void;
}

function VaultBoy({ pose }: { pose: Pose }) {
  return (
    <img
      src={vaultBoy}
      alt="Vault Boy giving a thumbs up"
      className="pipboy-figure-image"
      data-pose={pose}
    />
  );
}

export default function PipBoyGate({ onUnlock }: PipBoyGateProps) {
  const [code, setCode] = useState("");
  const [pose, setPose] = useState<Pose>("thumbs");
  const [error, setError] = useState("");

  const submitCode = () => {
    if (code === "1984") {
      setError("");
      onUnlock();
      return;
    }

    setError("ACCESS DENIED // INVALID VAULT CODE");
    setCode("");
  };

  return (
    <main className="pipboy-gate min-h-screen flex items-center justify-center p-4">
      <section className="pipboy-terminal w-full max-w-2xl">
        <header className="pipboy-header">
          <div>
            <div className="pipboy-label">VAULT-TEC PERSONNEL TERMINAL</div>
            <h1 className="pipboy-title">PIP-BOY // VAULT ACCESS</h1>
          </div>
          <div className="pipboy-status">SYSTEM ONLINE</div>
        </header>

        <div className="pipboy-screen">
          <div className="pipboy-figure">
            <VaultBoy pose={pose} />
          </div>

          <div className="pipboy-copy">
            <div className="pipboy-label">SECURITY CHECKPOINT</div>
            <h2>ENTER VAULT CODE</h2>
            <p>AUTHORIZED PERSONNEL ONLY // CODE REQUIRED TO VIEW POSTS</p>

            <div className="pipboy-code-row">
              <input
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 4));
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitCode();
                }}
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                aria-label="Vault code"
                className="pipboy-code-input"
              />
              <button type="button" onClick={submitCode} className="pipboy-submit">
                ENTER
              </button>
            </div>

            {error && <div className="pipboy-error">{error}</div>}

            <div className="pipboy-controls">
              <button
                type="button"
                onClick={() => setPose("thumbs")}
                className={pose === "thumbs" ? "active" : ""}
              >
                THUMBS UP
              </button>
              <button
                type="button"
                onClick={() => setPose("arms")}
                className={pose === "arms" ? "active" : ""}
              >
                READY
              </button>
            </div>
          </div>
        </div>

        <footer className="pipboy-footer">
          VAULT-TEC // PROPERTY OF VAULT-TEC INDUSTRIES // TERMINAL 1984
        </footer>
      </section>
    </main>
  );
}
