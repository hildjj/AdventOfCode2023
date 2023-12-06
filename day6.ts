import { type MainArgs, Utils } from './utils.ts';

interface TimeDistance {
  time: number;
  dist: number;
}

// d = (t - x) * x
// -x**2 + tx - d = 0
function quadratic(a: number, b: number, c: number): number {
  const rad = Math.sqrt(b ** 2 - 4 * a * c);
  const roots = [(-b + rad) / (2 * a), (-b - rad) / (2 * a)]
    .sort((a, b) => a - b);
  return Math.ceil(roots[1] - 1) - Math.floor(roots[0] + 1) + 1;
}

function part1(inp: TimeDistance[]): number {
  return inp
    .map(({ time, dist }) => quadratic(-1, time, -dist))
    .reduce((t, v) => t * v, 1);
}

function part2(inp: TimeDistance[]): number {
  const time = Number(inp.reduce((t, v) => t + String(v.time), ''));
  const dist = Number(inp.reduce((t, v) => t + String(v.dist), ''));

  return quadratic(-1, time, -dist);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<TimeDistance[]>(args);
  return [part1(inp), part2(inp)];
}
