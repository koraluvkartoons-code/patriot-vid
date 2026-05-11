// Persistent guest identity for live chat (no signup).
const NAME_KEY = "patriotvid_guest_name";
const SESSION_KEY = "patriotvid_guest_session";

export function getGuestName(): string {
  let n = localStorage.getItem(NAME_KEY);
  if (!n) {
    n = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(NAME_KEY, n);
  }
  return n;
}

export function getGuestSessionId(): string {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}
