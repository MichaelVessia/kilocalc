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

  test("kgToLbs handles zero", () => {
    expect(kgToLbs(0)).toBe(0);
  });

  test("lbsToKg handles zero", () => {
    expect(lbsToKg(0)).toBe(0);
  });

  test("kgToLbs handles very large values", () => {
    expect(kgToLbs(1000)).toBeCloseTo(2204.62, 1);
    expect(kgToLbs(500.5)).toBeCloseTo(1103.41, 1);
  });

  test("lbsToKg handles very large values", () => {
    expect(lbsToKg(1000)).toBeCloseTo(453.59, 2);
    expect(lbsToKg(999.99)).toBeCloseTo(453.59, 2);
  });

  test("kgToLbs handles small fractional values", () => {
    expect(kgToLbs(0.5)).toBeCloseTo(1.10, 2);
    expect(kgToLbs(1.25)).toBeCloseTo(2.76, 2);
  });

  test("lbsToKg handles small fractional values", () => {
    expect(lbsToKg(2.5)).toBeCloseTo(1.13, 2);
    expect(lbsToKg(5.5)).toBeCloseTo(2.49, 2);
  });

  test("conversions are reversible", () => {
    expect(lbsToKg(kgToLbs(100))).toBeCloseTo(100, 5);
    expect(kgToLbs(lbsToKg(220))).toBeCloseTo(220, 5);
    expect(lbsToKg(kgToLbs(45.5))).toBeCloseTo(45.5, 5);
  });

  test("displayWeight formats correctly", () => {
    expect(displayWeight(100)).toBe("100");
    expect(displayWeight(100.5)).toBe("100.50");
    expect(displayWeight(45.36)).toBe("45.36");
  });

  test("displayWeight removes .00 suffix", () => {
    expect(displayWeight(20)).toBe("20");
    expect(displayWeight(45)).toBe("45");
    expect(displayWeight(0)).toBe("0");
  });

  test("displayWeight handles small decimals", () => {
    expect(displayWeight(2.5)).toBe("2.50");
    expect(displayWeight(1.25)).toBe("1.25");
    expect(displayWeight(0.5)).toBe("0.50");
  });

  test("displayWeight handles precision edge cases", () => {
    expect(displayWeight(5.51155655)).toBe("5.51");
    expect(displayWeight(2.20462262)).toBe("2.20");
    expect(displayWeight(99.999)).toBe("100");
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

  test("rounds nearest at exact midpoint", () => {
    // At 2.5 boundary: roundTo = 5, midpoint = 2.5
    expect(plateRound(102.5, 2.5, "nearest")).toBe(105);
    expect(plateRound(107.5, 2.5, "nearest")).toBe(110);
  });

  test("plateRound with 1.25kg plates", () => {
    // roundTo = 2.5
    expect(plateRound(100, 1.25, "nearest")).toBe(100);
    expect(plateRound(101, 1.25, "nearest")).toBe(100);
    expect(plateRound(101.5, 1.25, "nearest")).toBe(102.5);
    expect(plateRound(102, 1.25, "up")).toBe(102.5);
    expect(plateRound(102.4, 1.25, "down")).toBe(100);
  });

  test("plateRound with 10kg plates", () => {
    // roundTo = 20
    expect(plateRound(100, 10, "nearest")).toBe(100);
    expect(plateRound(109, 10, "nearest")).toBe(100);
    expect(plateRound(110, 10, "nearest")).toBe(120);
    expect(plateRound(101, 10, "up")).toBe(120);
    expect(plateRound(119, 10, "down")).toBe(100);
  });

  test("plateRound with 25kg plates", () => {
    // roundTo = 50
    expect(plateRound(100, 25, "nearest")).toBe(100);
    expect(plateRound(124, 25, "nearest")).toBe(100);
    expect(plateRound(125, 25, "nearest")).toBe(150);
    expect(plateRound(101, 25, "up")).toBe(150);
    expect(plateRound(149, 25, "down")).toBe(100);
  });

  test("plateRound with 45lb plates", () => {
    // roundTo = 90
    expect(plateRound(225, 45, "nearest")).toBe(270);
    expect(plateRound(180, 45, "nearest")).toBe(180);
    expect(plateRound(220, 45, "up")).toBe(270);
    expect(plateRound(269, 45, "down")).toBe(180);
  });

  test("plateRound handles zero weight", () => {
    expect(plateRound(0, 2.5, "nearest")).toBe(0);
    expect(plateRound(0, 5, "up")).toBe(0);
    expect(plateRound(0, 10, "down")).toBe(0);
  });

  test("plateRound handles small weights", () => {
    expect(plateRound(2, 2.5, "nearest")).toBe(0);
    expect(plateRound(3, 2.5, "nearest")).toBe(5);
    expect(plateRound(1, 2.5, "up")).toBe(5);
    expect(plateRound(4, 2.5, "down")).toBe(0);
  });

  test("plateRound handles very large weights", () => {
    expect(plateRound(500, 2.5, "nearest")).toBe(500);
    expect(plateRound(501, 2.5, "nearest")).toBe(500);
    expect(plateRound(503, 2.5, "nearest")).toBe(505);
  });

  test("plateRound with fractional weights and 2.5 plates", () => {
    expect(plateRound(100.5, 2.5, "nearest")).toBe(100);
    expect(plateRound(103.7, 2.5, "nearest")).toBe(105);
    expect(plateRound(100.1, 2.5, "up")).toBe(105);
  });
});
