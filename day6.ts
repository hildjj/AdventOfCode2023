import { type MainArgs, Utils } from './utils.ts';

interface TimeDistance {
  time: number;
  dist: number;
}

function part1(inp: TimeDistance[]): number {
  return inp.map(({ time, dist }) => {
    let count = 0;
    for (let i = 0; i < time; i++) {
      if (i * (time - i) > dist) {
        count++;
      }
    }
    return count;
  }).reduce((t, v) => t * v, 1);
}

function part2(inp: TimeDistance[]): number {
  const time = BigInt(inp.reduce((t, v) => t + String(v.time), ''));
  const dist = BigInt(inp.reduce((t, v) => t + String(v.dist), ''));

  // TODO(hildjj): binary seach for the edges
  let count = 0;
  for (let i = 0n; i < time; i++) {
    if (i * (time - i) > dist) {
      count++;
    }
  }
  return count;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<TimeDistance[]>(args);
  return [part1(inp), part2(inp)];
}
