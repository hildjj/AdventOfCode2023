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

function near(
  len: number,
  loc: Location,
  lineSyms: Record<number, Sym[]>,
): boolean {
  // Left or right
  for (const sym of (lineSyms[loc.line] ?? [])) {
    if (sym.loc.column === loc.column - 1) {
      return true;
    }
    if (sym.loc.column === loc.column + len) {
      return true;
    }
  }
  // Num above or below symbol
  for (
    const sym of [
      ...(lineSyms[loc.line - 1] ?? []),
      ...(lineSyms[loc.line + 1] ?? []),
    ]
  ) {
    if (
      (sym.loc.column >= (loc.column - 1)) &&
      (sym.loc.column <= (loc.column + len))
    ) {
      return true;
    }
  }
  return false;
}

function part1(inp: Entry[]): number {
  const syms = inp.filter((e) => Object.hasOwn(e, 'sym')) as Sym[];
  const lineSyms = Object.groupBy(syms, (s) => s.loc.line);
  const nums = inp.filter((e) => Object.hasOwn(e, 'num')) as Num[];

  let total = 0;
  for (const { num, len, loc } of nums) {
    if (near(len, loc, lineSyms)) {
      total += num;
    }
  }

  return total;
}

function numsNear(sloc: Location, lineNums: Record<number, Num[]>): number[] {
  const res: number[] = [];
  // Left or right
  for (const { num, len, loc } of lineNums[sloc.line] ?? []) {
    if (sloc.column === loc.column - 1) {
      res.push(num);
      continue;
    }
    if (sloc.column === loc.column + len) {
      res.push(num);
      continue;
    }
  }
  // Num above and below symbol
  for (
    const { num, len, loc } of [
      ...(lineNums[sloc.line - 1] ?? []),
      ...(lineNums[sloc.line + 1] ?? []),
    ]
  ) {
    if (
      (sloc.column >= (loc.column - 1)) &&
      (sloc.column <= (loc.column + len))
    ) {
      res.push(num);
    }
  }

  return res;
}

function part2(inp: Entry[]): number {
  const gears = inp.filter((e) => (e as Sym).sym === '*') as Sym[];
  const nums = inp.filter((e) => Object.hasOwn(e, 'num')) as Num[];
  const lineNums = Object.groupBy(nums, (n) => n.loc.line);

  let total = 0;
  for (const g of gears) {
    const nn = numsNear(g.loc, lineNums);
    if (nn.length === 2) {
      total += nn[0] * nn[1];
    }
  }
  return total;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<Entry[]>(args);
  return [part1(inp), part2(inp)];
}
