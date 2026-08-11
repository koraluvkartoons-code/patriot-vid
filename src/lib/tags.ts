export function tagClass(category?: string): string {
  const c = (category || "LOG").toUpperCase();
  if (c.includes("BREAK")) return "text-term-red";
  if (c.includes("GAM")) return "text-term-green";
  if (c.includes("ANIME")) return "text-term-purple";
  if (c.includes("POLI")) return "text-term-yellow";
  return "text-term-cyan";
}

export function tagLabel(category?: string): string {
  return (category || "LOG").toUpperCase().replace(/\s+/g, "_").slice(0, 14);
}

export function logTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
