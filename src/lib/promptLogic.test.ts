import { describe, expect, it } from "vitest";
import { selectRollPrompt } from "@/lib/promptLogic";

describe("prompt selection", () => {
  it("uses the drug-specific prompt first", () => {
    expect(selectRollPrompt("nafithromycin", ["nafithromycin"], [])).toBe("A");
    expect(selectRollPrompt("azithromycin", ["azithromycin"], [])).toBe("B");
    expect(selectRollPrompt("amoxclav", ["amoxclav"], [])).toBe("B");
  });

  it("shows nothing rather than repeating a prompt", () => {
    expect(selectRollPrompt("amoxclav", ["azithromycin", "amoxclav"], ["B"])).toBeNull();
  });

  it("offers D only once all three balls have been rolled", () => {
    expect(selectRollPrompt("amoxclav", ["azithromycin", "amoxclav"], ["B"])).toBeNull();
    expect(selectRollPrompt("amoxclav", ["azithromycin", "nafithromycin", "amoxclav"], ["B", "A"])).toBe("D");
  });

  it("prefers an unused drug prompt over D", () => {
    expect(selectRollPrompt("nafithromycin", ["azithromycin", "amoxclav", "nafithromycin"], ["B"])).toBe("A");
  });

});
