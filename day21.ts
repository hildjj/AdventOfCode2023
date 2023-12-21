import { type MainArgs, readAllLines } from './lib/utils.ts';
import { InfiniteRect, Rect } from './lib/rect.ts';
import { assert } from '$std/assert/assert.ts';

function part1(inp: string[][]): number {
  const r = new Rect(inp);
  const S = r.indexOf('S');
  assert(S);
  let points = [S];

  const visited = new Set<string>();
  for (let i = 0; i < 64; i++) {
    visited.clear();
    points = points.map((c) =>
      c.cardinal()
        .filter((c) => r.get(c) !== '#')
        .filter((c) => {
          const ps = c.toString();
          if (!visited.has(ps)) {
            visited.add(ps);
            return true;
          }
          return false;
        })
    ).flat();
  }
  return visited.size;
}

function part2(inp: string[][]): number {
  const r = new InfiniteRect(inp);
  const S = r.indexOf('S');
  assert(S);
  let points = [S];

  const visited = new Set<string>();
  const counts = [0];

  for (let i = 0; i < 328; i++) {
    visited.clear();
    points = points.map((c) =>
      c.cardinal()
        .filter((c) => r.get(c) !== '#')
        .filter((c) => {
          const ps = c.toString();
          if (!visited.has(ps)) {
            visited.add(ps);
            return true;
          }
          return false;
        })
    ).flat();
    counts.push(visited.size);
  }

  const n = Math.floor(26501365 / r.width);

  // Finite differences
  const a0 = counts[S.x];
  const a1 = counts[S.x + r.width];
  const a2 = counts[S.x + r.width * 2];
  const b0 = a1 - a0;
  const b1 = a2 - a1;
  const c0 = b1 - b0;
  // See https://en.wikipedia.org/wiki/Binomial_coefficient
  // (a0 0) + (b0 1) + (c0 2)
  return a0 + (b0 * n) + (n * (n - 1) / 2) * c0;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = (await readAllLines(args)).map((x) => x.split(''));
  return [part1(inp), part2(inp)];
}
