import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type UserProfile, setCurrentUserId, getCurrentUserId } from "@/lib/store";
import { upsertProfile, fetchProfiles } from "@/lib/api";
import { Camera } from "lucide-react";

interface Props {
  open: boolean;
  onComplete: (userId: string) => void;
}

export default function UserSetupDialog({ open, onComplete }: Props) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill with current user data if returning
  useEffect(() => {
    if (open) {
      const current = getCurrentUserId();
      if (current) {
        setName(current);
        fetchProfiles().then(profiles => {
          const p = profiles[current];
          if (p) {
            setAvatar(p.avatar || "");
            setExistingProfile(p);
          }
        });
      }
    }
  }, [open]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Always fetch latest profile from DB to preserve badges, mod, admin
    const profiles = await fetchProfiles();
    const existing = profiles[trimmed];
    await upsertProfile({
      displayName: trimmed,
      avatar: avatar || existing?.avatar || "",
      badges: existing?.badges || [],
      isAdmin: existing?.isAdmin,
      isModerator: existing?.isModerator,
    });
    setCurrentUserId(trimmed);
    onComplete(trimmed);
  };

  // When name changes, check if that profile already exists to preserve their data
  const handleNameChange = (val: string) => {
    setName(val);
  };

  const handleNameBlur = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const profiles = await fetchProfiles();
    const p = profiles[trimmed];
    if (p) {
      setExistingProfile(p);
      if (p.avatar && !avatar) setAvatar(p.avatar);
    } else {
      setExistingProfile(null);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="gradient-card border-border glow-pink max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-xl">Welcome to Patriot.Vid!</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-center text-sm">Choose your display name & profile picture</p>
        <div className="flex flex-col items-center gap-4 pt-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary hover:border-accent transition-colors"
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Input
            placeholder="Display name..."
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            maxLength={24}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button onClick={submit} disabled={!name.trim()} className="w-full gradient-btn text-foreground font-semibold">
            Let's Go! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
