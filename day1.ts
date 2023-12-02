import { type MainArgs, Utils } from './utils.ts';

function part1(inp: string[]): number {
  return inp.reduce((t, v) => {
    const m = [...v.matchAll(/[0-9]/g)];
    if (m.length > 1) {
      return t + parseInt(`${m[0][0]}${m[m.length - 1][0]}`);
    }
    return t;
  }, 0);
}

function part2(inp: string[]): number {
  const digits = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
  ];
  const dv = Object.fromEntries(digits.map((d, i) => [d, String(i + 1)]));
  const dr = new RegExp(digits.join('|'), 'g');
  return inp.reduce((t, v) => {
    let last = v;
    do {
      last = v;
      v = v.replace(dr, (s) => {
        return dv[s] + s.slice(1);
      });
    } while (last !== v);
    const m = [...v.matchAll(/[0-9]/g)];
    if (m.length > 0) {
      const n = parseInt(`${m[0][0]}${m[m.length - 1][0]}`);
      return t + n;
    }
    return t;
  }, 0);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.readAllLines(args);
  return [part1(inp), part2(inp)];
}
