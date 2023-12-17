import { type MainArgs, parseFile } from './lib/utils.ts';

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

/**
 * Find the place between start and end where fn(t) changes values.
 */
function findChange(
  start: number,
  end: number,
  fn: (t: number) => boolean,
): number {
  while (start < end) {
    const t2 = Math.floor((start + end) / 2);
    if (fn(t2)) {
      if (!fn(t2 + 1)) {
        return t2;
      }
      start = t2;
    } else {
      end = t2;
    }
  }

  throw new Error('Not found');
}

function part2(inp: TimeDistance[]): number {
  const time = Number(inp.reduce((t, v) => t + String(v.time), ''));
  const dist = Number(inp.reduce((t, v) => t + String(v.dist), ''));

  // Confirmed that there is only one range, which covers the midpoint.
  // Approach: start at midpoint and work out.
  const t2 = time / 2;
  if (t2 * (time - t2) <= dist) {
    throw new Error('Range not near half');
  }
  const top = findChange(t2, time, (t) => t * (time - t) > dist);
  const bottom = findChange(0, t2, (t) => t * (time - t) <= dist);

  return top - bottom;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<TimeDistance[]>(args);
  return [part1(inp), part2(inp)];
}
