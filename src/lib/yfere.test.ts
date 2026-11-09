import { describe, expect, it } from "vitest";
import { categoryTone, chainItems, YFERE_SITE } from "./yfere";
import { countryFlag, rankKekScores } from "./kekScoreboard";
import type { Post } from "./store";

const item = (id: string, createdAt: string): Post => ({ id, createdAt, userId: "Tester", title: "", description: "", likes: [] });
describe("YFERE", () => {
  it("connects each new item after the previous item regardless of pinning", () => {
    expect(chainItems([{ ...item("new", "2026-11-09T02:00:00Z"), isPinned: true }, item("old", "2026-11-09T01:00:00Z")]).map(p => p.id)).toEqual(["old", "new"]);
  });
  it("does not repeat items when more of the chain loads", () => {
    expect(chainItems([item("a", "2026-11-09"), item("a", "2026-11-09")])).toHaveLength(1);
  });
  it("uses the same color for a category on every item", () => {
    expect(categoryTone("Photos")).toBe(categoryTone("PHOTOS"));
    expect(categoryTone("Photos")).toBe(1);
  });
  it("keeps the YFERE feed separate from KEK", () => { expect(YFERE_SITE).toBe("yfere"); });
  it("ranks usernames by post count with their selected flag", () => {
    const scores = rankKekScores([{ username: "A", posts: 1, countryCode: "JP" }, { username: "B", posts: 3, countryCode: "US" }]);
    expect(scores.map(s => [s.username, s.posts, countryFlag(s.countryCode)])).toEqual([["B", 3, "🇺🇸"], ["A", 1, "🇯🇵"]]);
  });
});