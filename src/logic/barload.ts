import { displayWeight } from "./units.ts";

export interface Plate {
  weight: number;
  pairs: number;
}

export type BarLoad = (number | string)[];

// Given a weight return an array of plates representing one side of the bar
export const weightToBarLoad = (
  weight: number,
  plates: Plate[],
  barWeight: number,
  collarWeight: number,
): BarLoad => {
  // The plates that will go on one side of the bar
  const barLoad: BarLoad = [];

  // If total weight is less than bar + collars, ignore collars
  const effectiveCollarWeight = weight < barWeight + collarWeight * 2 ? 0 : collarWeight;

  const barAndCollarWeight = Number(displayWeight(barWeight + effectiveCollarWeight * 2));
  // Amount of weight to go on one side of the bar
  let sideWeight = (weight - barAndCollarWeight) / 2;

  for (let i = 0; i < plates.length; i++) {
    const plate = plates[i];
    let pairsAvailable = plate.pairs;
    while (plate.weight <= sideWeight && pairsAvailable > 0) {
      barLoad.push(plate.weight);
      sideWeight -= plate.weight;
      pairsAvailable--;
    }
  }

  if (sideWeight > 0) {
    barLoad.push(sideWeight.toFixed(3));
  }
  return barLoad;
};
