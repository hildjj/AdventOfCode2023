import { type MainArgs, Utils } from './utils.ts';

interface Draw {
  red?: number;
  green?: number;
  blue?: number;
}
type Game = [num: number, draws: Draw[]];

const COLORS = ['red', 'green', 'blue'] as (keyof Draw)[];

function part1(inp: Game[]): number {
  const max: Required<Draw> = {
    red: 12,
    green: 13,
    blue: 14,
  };
  let total = 0;

  OUTER:
  for (const [num, draws] of inp) {
    for (const counts of draws) {
      for (const c of COLORS) {
        if (Object.hasOwn(counts, c) && (counts[c]! > max[c])) {
          continue OUTER;
        }
      }
    }
    total += num;
  }
  return total;
}

function part2(inp: Game[]): number {
  let total = 0;

  for (const [_num, draws] of inp) {
    const max: Required<Draw> = {
      red: 0,
      green: 0,
      blue: 0,
    };

    for (const counts of draws) {
      for (const c of COLORS) {
        if (Object.hasOwn(counts, c) && (counts[c]! > max[c])) {
          max[c] = counts[c]!;
        }
      }
    }
    total += max.red * max.green * max.blue;
  }
  return total;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<Game[]>(args);
  return [part1(inp), part2(inp)];
}
