import { describe, expect, it } from "vitest";
import { countryFlag, rankKekScores } from "./kekScoreboard";

describe("KEK scoreboard", () => {
  it("ranks usernames by number of posts", () => {
    expect(rankKekScores([
      { username: "First", posts: 2, countryCode: null },
      { username: "Poster", posts: 7, countryCode: "US" },
    ]).map(row => [row.username, row.posts])).toEqual([["Poster", 7], ["First", 2]]);
  });
  it("shows the country flag chosen for a username", () => {
    expect(countryFlag("US")).toBe("🇺🇸");
    expect(countryFlag("JP")).toBe("🇯🇵");
    expect(countryFlag(null)).toBe("🏳️");
  });
});