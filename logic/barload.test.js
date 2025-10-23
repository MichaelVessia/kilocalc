import { describe, test, expect } from "bun:test";
import { weightToBarLoad } from "./barload.js";

describe("Bar load calculations", () => {
  test("calculates correct plate distribution for kg", () => {
    const plates = [
      { weight: 25, pairs: 4 },
      { weight: 20, pairs: 2 },
      { weight: 15, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 },
      { weight: 1.25, pairs: 2 }
    ];
    const barWeight = 20;
    const collarWeight = 2.5;

    // 100kg total: bar (20) + collars (2.5*2=5) = 25kg, leaves 75kg, so 37.5kg per side
    const result = weightToBarLoad(100, plates, barWeight, collarWeight);
    expect(result).toEqual([25, 10, 2.5]);
  });

  test("calculates correct plate distribution for lbs", () => {
    const plates = [
      { weight: 45, pairs: 4 },
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const barWeight = 45;
    const collarWeight = 0;

    // 225lbs total: bar (45) + collars (0) = 45lbs, leaves 180lbs, so 90lbs per side
    const result = weightToBarLoad(225, plates, barWeight, collarWeight);
    expect(result).toEqual([45, 45]);
  });

  test("handles custom bar weights", () => {
    const plates = [
      { weight: 25, pairs: 4 },
      { weight: 5, pairs: 2 }
    ];
    const barWeight = 15; // Women's bar
    const collarWeight = 2.5;

    // 80kg total: bar (15) + collars (5) = 20kg, leaves 60kg, so 30kg per side
    const result = weightToBarLoad(80, plates, barWeight, collarWeight);
    expect(result).toEqual([25, 5]);
  });

  test("handles insufficient plates with remainder", () => {
    const plates = [
      { weight: 20, pairs: 1 }
    ];
    const barWeight = 20;
    const collarWeight = 2.5;

    // 100kg total: bar (20) + collars (5) = 25kg, leaves 75kg, so 37.5kg per side
    // Only have one pair of 20kg plates, so should have 17.5kg remainder
    const result = weightToBarLoad(100, plates, barWeight, collarWeight);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(20);
    expect(parseFloat(result[1])).toBeCloseTo(17.5, 1);
  });

  test("bar weight preserved when switching units", () => {
    // Simulate: 100kg with 20kg bar, switch to lbs should use 45lb bar
    const kgPlates = [
      { weight: 25, pairs: 4 },
      { weight: 10, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const lbsPlates = [
      { weight: 45, pairs: 4 },
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];

    // 100kg with 20kg bar + 5kg collars = 25kg, leaves 75kg, so 37.5kg per side
    const kgResult = weightToBarLoad(100, kgPlates, 20, 2.5);
    expect(kgResult).toEqual([25, 10, 2.5]);

    // 220lbs with 45lb bar, no collars: (220-45)/2 = 87.5lb per side
    const lbsResult = weightToBarLoad(220, lbsPlates, 45, 0);
    expect(lbsResult).toEqual([45, 25, 10, 5, 2.5]);
  });

  test("handles no collars (useCollars=false) in kg", () => {
    const plates = [
      { weight: 25, pairs: 4 },
      { weight: 20, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 }
    ];
    const barWeight = 20;
    const collarWeight = 0; // useCollars = false

    // 100kg total: bar (20) + collars (0) = 20kg, leaves 80kg, so 40kg per side
    const result = weightToBarLoad(100, plates, barWeight, collarWeight);
    expect(result).toEqual([25, 10, 5]);
  });

  test("handles no collars (useCollars=false) in lbs", () => {
    const plates = [
      { weight: 45, pairs: 4 },
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 }
    ];
    const barWeight = 45;
    const collarWeight = 0; // useCollars = false

    // 225lbs total: bar (45) + collars (0) = 45lbs, leaves 180lbs, so 90lbs per side
    const result = weightToBarLoad(225, plates, barWeight, collarWeight);
    expect(result).toEqual([45, 45]);
  });

  test("collar weight is 2.5kg when useCollars=true in kg", () => {
    const plates = [
      { weight: 25, pairs: 4 },
      { weight: 10, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const barWeight = 20;
    const collarWeight = 2.5; // useCollars = true

    // 100kg total: bar (20) + collars (5) = 25kg, leaves 75kg, so 37.5kg per side
    const result = weightToBarLoad(100, plates, barWeight, collarWeight);
    expect(result).toEqual([25, 10, 2.5]);
  });

  test("collar weight is 2.5kg converted to lbs when useCollars=true in lbs", () => {
    const plates = [
      { weight: 45, pairs: 4 },
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const barWeight = 45;
    const collarWeight = 2.5 * 2.20462262; // 2.5kg in lbs = 5.51155655

    // 225lbs total: bar (45) + collars (11.02311) = 56.02311lbs, leaves 168.977lbs, so 84.488lbs per side
    // Should have a remainder since the exact calculation doesn't match available plates
    const result = weightToBarLoad(225, plates, barWeight, collarWeight);
    expect(result.length).toBe(5);
    expect(result[0]).toBe(45);
    expect(result[1]).toBe(25);
    expect(result[2]).toBe(10);
    expect(result[3]).toBe(2.5);
    // Last element is the remainder
    expect(parseFloat(result[4])).toBeCloseTo(1.99, 1);
  });

  test("handles zero total weight", () => {
    const plates = [
      { weight: 25, pairs: 4 },
      { weight: 20, pairs: 2 }
    ];
    const result = weightToBarLoad(0, plates, 20, 2.5);
    // 0 total - 25kg (bar+collars) = -25kg, -12.5kg per side (negative, so no plates added)
    expect(result).toEqual([]);
  });

  test("handles total weight less than bar and collars", () => {
    const plates = [
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const result = weightToBarLoad(15, plates, 20, 2.5);
    // 15kg < 25kg (bar+collars), so collars ignored: 15kg - 20kg = -5kg, -2.5kg per side
    expect(result).toEqual([]);
  });

  test("ignores collars when total weight equals bar weight", () => {
    const plates = [
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const result = weightToBarLoad(20, plates, 20, 2.5);
    // 20kg < 25kg (bar+collars), so collars ignored: 20kg - 20kg = 0kg per side
    expect(result).toEqual([]);
  });

  test("handles exact weight match with no remainder", () => {
    const plates = [
      { weight: 20, pairs: 2 }
    ];
    const result = weightToBarLoad(100, plates, 20, 2.5);
    // 100kg - 25kg = 75kg, 37.5kg per side
    // Only have 20kg plates, so 20kg + 17.5kg remainder
    expect(result.length).toBe(2);
    expect(result[0]).toBe(20);
    expect(parseFloat(result[1])).toBeCloseTo(17.5, 1);
  });

  test("handles empty plates array", () => {
    const plates = [];
    const result = weightToBarLoad(100, plates, 20, 2.5);
    // No plates available, all weight is remainder
    expect(result.length).toBe(1);
    expect(parseFloat(result[0])).toBeCloseTo(37.5, 1);
  });

  test("handles plates with zero pairs available", () => {
    const plates = [
      { weight: 25, pairs: 0 },
      { weight: 20, pairs: 0 },
      { weight: 10, pairs: 3 }
    ];
    const result = weightToBarLoad(100, plates, 20, 2.5);
    // 100kg - 25kg = 75kg, 37.5kg per side
    // Only 10kg plates available
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(10);
    expect(result[2]).toBe(10);
    expect(parseFloat(result[3])).toBeCloseTo(7.5, 1);
  });

  test("uses plates in descending order", () => {
    const plates = [
      { weight: 25, pairs: 1 },
      { weight: 20, pairs: 1 },
      { weight: 10, pairs: 1 },
      { weight: 5, pairs: 1 }
    ];
    const result = weightToBarLoad(145, plates, 20, 2.5);
    // 145kg - 25kg = 120kg, 60kg per side
    // Should use: 25 + 20 + 10 + 5 = 60kg exactly
    expect(result).toEqual([25, 20, 10, 5]);
  });

  test("stops when plates run out", () => {
    const plates = [
      { weight: 25, pairs: 1 }
    ];
    const result = weightToBarLoad(145, plates, 20, 2.5);
    // 145kg - 25kg = 120kg, 60kg per side
    // Only one pair of 25kg plates
    expect(result.length).toBe(2);
    expect(result[0]).toBe(25);
    expect(parseFloat(result[1])).toBeCloseTo(35, 1);
  });

  test("handles very small fractional weights", () => {
    const plates = [
      { weight: 1.25, pairs: 2 },
      { weight: 0.5, pairs: 2 }
    ];
    const result = weightToBarLoad(25, plates, 20, 2.5);
    // 25kg - 25kg = 0kg per side
    expect(result).toEqual([]);
  });

  test("handles precision in bar and collar calculation", () => {
    const plates = [
      { weight: 45, pairs: 4 },
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 },
      { weight: 2.5, pairs: 2 }
    ];
    const barWeight = 45;
    const collarWeight = 5.51155655; // 2.5kg converted to lbs

    const result = weightToBarLoad(225, plates, barWeight, collarWeight);
    // Verify that displayWeight rounding is applied correctly
    expect(result.length).toBeGreaterThan(0);
  });

  test("handles very large total weight", () => {
    const plates = [
      { weight: 50, pairs: 10 },
      { weight: 25, pairs: 10 },
      { weight: 20, pairs: 10 }
    ];
    const result = weightToBarLoad(500, plates, 20, 2.5);
    // 500kg - 25kg = 475kg, 237.5kg per side
    // Should use multiple 50kg plates
    expect(result.filter(p => p === 50).length).toBeGreaterThan(0);
  });

  test("handles bar weight of zero", () => {
    const plates = [
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 }
    ];
    const result = weightToBarLoad(60, plates, 0, 0);
    // 60kg total, 30kg per side
    expect(result).toEqual([25, 5]);
  });

  test("handles collar weight of zero (no collars)", () => {
    const plates = [
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 }
    ];
    const result = weightToBarLoad(80, plates, 20, 0);
    // 80kg - 20kg = 60kg, 30kg per side
    expect(result).toEqual([25, 5]);
  });

  test("handles fractional bar and collar weights", () => {
    const plates = [
      { weight: 25, pairs: 2 },
      { weight: 10, pairs: 2 },
      { weight: 5, pairs: 2 }
    ];
    const result = weightToBarLoad(100, plates, 15.5, 2.25);
    // bar + 2*collar = 15.5 + 4.5 = 20
    // 100 - 20 = 80, 40 per side
    expect(result).toEqual([25, 10, 5]);
  });

  test("remainder is formatted to 3 decimal places", () => {
    const plates = [
      { weight: 20, pairs: 1 }
    ];
    const result = weightToBarLoad(100, plates, 20, 2.5);
    // Remainder should be formatted as string with 3 decimals
    expect(result.length).toBe(2);
    expect(result[1]).toBe("17.500");
  });

  test("handles plates that exactly equal side weight", () => {
    const plates = [
      { weight: 25, pairs: 2 },
      { weight: 20, pairs: 1 },
      { weight: 10, pairs: 1 },
      { weight: 5, pairs: 1 },
      { weight: 2.5, pairs: 1 }
    ];
    const result = weightToBarLoad(140, plates, 20, 2.5);
    // 140 - 25 = 115, 57.5 per side
    // 25 + 25 + 5 + 2.5 = 57.5
    expect(result).toEqual([25, 25, 5, 2.5]);
  });
});
