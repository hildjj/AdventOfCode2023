import { type MainArgs, parseFile } from './lib/utils.ts';
import { Sequence } from './lib/sequence.ts';

function diffs(
  inp: number[][],
  fn: (t: number, row: number[]) => number,
): number {
  let total = 0;
  for (const history of inp) {
    let next = [];
    let done = true;
    const rows: number[][] = [history];
    do {
      const seq = new Sequence(rows[rows.length - 1]);
      done = true;
      for (const diff of seq.windows(2).map(([a, b]) => b - a)) {
        next.push(diff);
        if (diff !== 0) {
          done = false;
        }
      }
      rows.push(next);
      next = [];
    } while (!done);

    total += rows.reduceRight(fn, 0);
  }

  return total;
}

function part1(inp: number[][]): number {
  return diffs(inp, (t, r) => t + r[r.length - 1]);
}

function part2(inp: number[][]): number {
  return diffs(inp, (t, r) => r[0] - t);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<number[][]>(args);
  return [part1(inp), part2(inp)];
}
