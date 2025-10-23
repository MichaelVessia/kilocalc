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
});
