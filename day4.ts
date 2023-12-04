import { type MainArgs, Utils } from './utils.ts';
import { Counter } from './counter.ts';

type Card = [
  num: number,
  winning: number[],
  have: number[],
];

function part1(inp: Card[]): number {
  let total = 0;
  for (const [_num, winning, have] of inp) {
    const ws = new Set(winning);
    let m = 0;
    for (const h of have) {
      if (ws.has(h)) {
        m = m ? m * 2 : 1;
      }
    }
    total += m;
  }
  return total;
}

function part2(inp: Card[]): number {
  const c = new Counter<number>();
  for (const [num, winning, have] of inp) {
    const ws = new Set(winning);
    let f = 0;
    for (const h of have) {
      if (ws.has(h)) {
        f++;
      }
    }
    c.add(num);
    for (let i = 1; i <= f; i++) {
      c.sum(c.get(num) ?? 0, num + i);
    }
  }
  return c.total();
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<Card[]>(args);
  return [part1(inp), part2(inp)];
}
