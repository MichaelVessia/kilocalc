import { describe, test, expect } from "bun:test";
import { kgToLbs, lbsToKg, displayWeight, plateRound } from "./units.js";

describe("Unit conversion", () => {
  test("kgToLbs converts correctly", () => {
    expect(kgToLbs(20)).toBeCloseTo(44.09, 2);
    expect(kgToLbs(100)).toBeCloseTo(220.46, 2);
    expect(kgToLbs(45.36)).toBeCloseTo(100, 2);
  });

  test("lbsToKg converts correctly", () => {
    expect(lbsToKg(45)).toBeCloseTo(20.41, 2);
    expect(lbsToKg(220)).toBeCloseTo(99.79, 2);
    expect(lbsToKg(100)).toBeCloseTo(45.36, 2);
  });

  test("displayWeight formats correctly", () => {
    expect(displayWeight(100)).toBe("100");
    expect(displayWeight(100.5)).toBe("100.50");
    expect(displayWeight(45.36)).toBe("45.36");
  });
});

describe("Plate rounding", () => {
  test("rounds nearest with 2.5 plates", () => {
    expect(plateRound(100, 2.5, "nearest")).toBe(100);
    expect(plateRound(102, 2.5, "nearest")).toBe(100);
    expect(plateRound(103, 2.5, "nearest")).toBe(105);
  });

  test("rounds up with 2.5 plates", () => {
    expect(plateRound(100, 2.5, "up")).toBe(100);
    expect(plateRound(101, 2.5, "up")).toBe(105);
    expect(plateRound(102.5, 2.5, "up")).toBe(105);
  });

  test("rounds down with 2.5 plates", () => {
    expect(plateRound(100, 2.5, "down")).toBe(100);
    expect(plateRound(104, 2.5, "down")).toBe(100);
    expect(plateRound(105, 2.5, "down")).toBe(105);
  });

  test("rounds with 5 lb plates", () => {
    expect(plateRound(220, 5, "nearest")).toBe(220);
    expect(plateRound(224, 5, "nearest")).toBe(220);
    expect(plateRound(226, 5, "nearest")).toBe(230);
  });
});
