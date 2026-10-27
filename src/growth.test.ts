import { describe, it, expect } from "vitest";
import raw from "../stories/template/story.json";
import { compileStory } from "./story-engine/compiler";
import { choose, dispatch, visible } from "./engine";
import { initialRuntime, type Runtime } from "./schema";

const { work } = compileStory(raw);
describe("AFTERGLOW growth chapter", () => {
  it("keeps the four-digit passcode including its initial zero", () => {
    expect(work.phone.passcode).toBe("0508");
  });
  it("finishes every combination without dead ends or multiple outcomes", () => {
    let leaves = 0;
    const outcomes = new Set<string>();
    const walk = (s: Runtime, depth: number) => {
      if (depth === 9) {
        expect(s.choices).toHaveLength(0);
        expect(s.endings).toHaveLength(1);
        outcomes.add(s.endings[0]);
        leaves++;
        return;
      }
      if (s.choices.length !== 3)
        throw Error(`Missing choice at slot ${depth}`);
      for (const c of s.choices) walk(choose(work, s, c.target), depth + 1);
    };
    walk(dispatch(work, initialRuntime(work), "start"), 0);
    expect(leaves).toBe(3 ** 9);
    expect(outcomes.size).toBe(3);
  }, 60000);
  it("accumulates stats, reveals only selected replies and survives save reload", () => {
    const started = dispatch(work, initialRuntime(work), "start");
    const first = choose(work, started, "option-0-0");
    expect(first.variables.vocal).toBe(49);
    expect(first.variables.energy).toBe(65);
    expect(started.variables.vocal).toBe(40);
    const items = work.data.kakao;
    expect(
      visible(
        items.find((i) => i.id === "reply-0-0")!,
        first,
      ),
    ).toBe(true);
    expect(
      visible(
        items.find((i) => i.id === "reply-0-1")!,
        first,
      ),
    ).toBe(false);
    const restored = JSON.parse(JSON.stringify(first));
    expect(choose(work, restored, "option-1-0")).toEqual(
      choose(work, first, "option-1-0"),
    );
    expect(choose(work, first, "option-0-1")).toEqual(first);
    expect(dispatch(work, first, "start").variables.vocal).toBe(49);
  });
  it("clamps growth values and triggers existing variable listeners", () => {
    const w = structuredClone(work);
    w.variables.vocal = 99;
    w.variables.energy = 2;
    w.nodes.push({
      ...w.nodes[0],
      id: "growth-listener",
      type: "event",
      event: "variable",
      target: "vocal",
      next: [],
      actions: [{ type: "variable", key: "observed", value: true }],
    });
    const s = choose(w, dispatch(w, initialRuntime(w), "start"), "option-0-0");
    expect(s.variables.vocal).toBe(100);
    expect(s.variables.energy).toBe(0);
    expect(s.variables.observed).toBe(true);
  });
});
