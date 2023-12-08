import { type MainArgs, Utils } from './utils.ts';
import { Sequence } from './sequence.ts';

interface Entry {
  L: string;
  R: string;
}

interface Input {
  directions: ('L' | 'R')[];
  map: Record<string, Entry>;
}

function pathLength(pos: string, end: RegExp, inp: Input): number {
  const s = new Sequence(inp.directions).ncycle(Infinity);
  let steps = 0;
  for (const LR of s) {
    if (end.test(pos)) {
      break;
    }
    pos = inp.map[pos][LR];
    steps++;
  }
  return steps;
}

function part1(inp: Input): number {
  return pathLength('AAA', /^ZZZ$/, inp);
}

function part2(inp: Input): number {
  const pos = Object.keys(inp.map).filter((x) => x.endsWith('A'));
  const lens = pos.map((x) => pathLength(x, /^..Z$/, inp));
  return Utils.lcm(...lens);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<Input>(args);
  return [part1(inp), part2(inp)];
}
