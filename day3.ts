import { type MainArgs, Utils } from './utils.ts';

interface Location {
  offset: number;
  line: number;
  column: number;
}

interface Sym {
  sym: string;
  loc: Location;
}

interface Num {
  num: number;
  len: number;
  loc: Location;
}

type Entry = Sym | Num;

function adjacent(num: Num, sym: Sym): boolean {
  // num left or right of sym, already in same row
  return (sym.loc.column === num.loc.column - 1) ||
    (sym.loc.column === num.loc.column + num.len);
}

function stacked(num: Num, sym: Sym): boolean {
  // num above or below sym, already in row above or below
  return (sym.loc.column >= (num.loc.column - 1)) &&
    (sym.loc.column <= (num.loc.column + num.len));
}

function near(
  num: Num,
  lineSyms: Record<number, Sym[]>,
): boolean {
  // Left or right
  if ((lineSyms[num.loc.line] ?? []).some((sym) => adjacent(num, sym))) {
    return true;
  }
  // Num above or below symbol
  if (
    [
      ...(lineSyms[num.loc.line - 1] ?? []),
      ...(lineSyms[num.loc.line + 1] ?? []),
    ].some((sym) => stacked(num, sym))
  ) {
    return true;
  }

  return false;
}

function part1(inp: Entry[]): number {
  const syms = inp.filter((e) => Object.hasOwn(e, 'sym')) as Sym[];
  const lineSyms = Object.groupBy(syms, (s) => s.loc.line);
  const nums = inp.filter((e) => Object.hasOwn(e, 'num')) as Num[];

  let total = 0;
  for (const n of nums) {
    if (near(n, lineSyms)) {
      total += n.num;
    }
  }

  return total;
}

function numsNear(gear: Sym, lineNums: Record<number, Num[]>): number[] {
  const res: number[] = (lineNums[gear.loc.line] ?? [])
    .filter((n) => adjacent(n, gear))
    .map((n) => n.num);

  return res.concat(
    [
      ...(lineNums[gear.loc.line - 1] ?? []),
      ...(lineNums[gear.loc.line + 1] ?? []),
    ].filter((n) => stacked(n, gear))
      .map((n) => n.num),
  );
}

function part2(inp: Entry[]): number {
  const gears = inp.filter((e) => (e as Sym).sym === '*') as Sym[];
  const nums = inp.filter((e) => Object.hasOwn(e, 'num')) as Num[];
  const lineNums = Object.groupBy(nums, (n) => n.loc.line);

  return gears
    .map((g) => numsNear(g, lineNums))
    .filter((a) => a.length === 2)
    .reduce((t, [v0, v1]) => t + (v0 * v1), 0);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<Entry[]>(args);
  return [part1(inp), part2(inp)];
}
