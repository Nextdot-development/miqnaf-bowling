import { describe, expect, it } from "vitest";
import { selectRollPrompt } from "@/lib/promptLogic";

describe("prompt selection", () => {
  it("uses the drug-specific prompt first", () => {
    expect(selectRollPrompt("nafithromycin", ["nafithromycin"], [])).toBe("A");
    expect(selectRollPrompt("azithromycin", ["azithromycin"], [])).toBe("B");
    expect(selectRollPrompt("clarithromycin", ["clarithromycin"], [])).toBe("B");
  });

  it("shows nothing rather than repeating a prompt", () => {
    expect(selectRollPrompt("clarithromycin", ["azithromycin", "clarithromycin"], ["B"])).toBeNull();
  });

  it("offers D only once all three balls have been rolled", () => {
    expect(selectRollPrompt("clarithromycin", ["azithromycin", "clarithromycin"], ["B"])).toBeNull();
    expect(selectRollPrompt("clarithromycin", ["azithromycin", "nafithromycin", "clarithromycin"], ["B", "A"])).toBe("D");
  });

  it("prefers an unused drug prompt over D", () => {
    expect(selectRollPrompt("nafithromycin", ["azithromycin", "clarithromycin", "nafithromycin"], ["B"])).toBe("A");
  });

});
