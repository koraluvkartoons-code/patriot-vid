import { describe, it, expect } from "vitest";
import { isWord, buildSentence } from "./lexiflux";
describe("lexiflux", () => {
  it("accepts real words only", () => { expect(isWord("CAT")).toBe(true); expect(isWord("xqz")).toBe(false); });
  it("builds a capitalized sentence", () => { expect(buildSentence(["the", "cat", "can", "run"])).toBe("The cat can run."); });
});
