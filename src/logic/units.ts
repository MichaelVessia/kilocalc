// Branded types for type-safe weight units
declare const KgBrand: unique symbol;
declare const LbsBrand: unique symbol;

export type Kg = number & { readonly [KgBrand]: typeof KgBrand };
export type Lbs = number & { readonly [LbsBrand]: typeof LbsBrand };

// Type for either unit
export type Weight = Kg | Lbs;

// Rounding mode type
export type RoundingMode = "up" | "down" | "nearest";

// Unit type
export type Unit = "kg" | "lbs";

// Helper functions to create branded types
export const kg = (value: number): Kg => value as Kg;
export const lbs = (value: number): Lbs => value as Lbs;

export const kgToLbs = (kgValue: Kg): Lbs => {
  return (kgValue * 2.20462262) as Lbs;
};

export const lbsToKg = (lbsValue: Lbs): Kg => {
  return (lbsValue / 2.20462262) as Kg;
};

export const displayWeight = (weight: number): string => {
  return weight.toFixed(2).replace(".00", "");
};

export const plateRound = (
  weight: number,
  smallestPlate: number,
  rounding: RoundingMode,
): number => {
  const roundTo = smallestPlate * 2;
  let roundingFn: (x: number) => number;
  if (rounding === "up") {
    roundingFn = Math.ceil;
  } else if (rounding === "down") {
    roundingFn = Math.floor;
  } else {
    roundingFn = Math.round;
  }
  return roundingFn(weight / roundTo) * roundTo;
};
