import { type MainArgs, parseFile } from './lib/utils.ts';
import { Counter } from './lib/counter.ts';

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
    c.add(num); // Always count the current card
    const ws = new Set(winning);
    const wins = have.filter((v) => ws.has(v)).length; // Intersection length
    const more = c.get(num);
    for (let i = 1; i <= wins; i++) {
      c.sum(more, num + i);
    }
  }
  return c.total();
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Card[]>(args);
  return [part1(inp), part2(inp)];
}
