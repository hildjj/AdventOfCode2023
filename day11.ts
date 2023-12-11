import { type MainArgs, parseFile } from './utils.ts';
import { Sequence } from './sequence.ts';

interface Location {
  line: number;
  column: number;
}

interface Input {
  locs: Location[];
  height: number;
  width: number;
}

function expandedDistance(inp: Input, expansion: number): number {
  const rows = new Set(inp.locs.map((x) => x.line));
  const cols = new Set(inp.locs.map((x) => x.column));
  const emptyRows = [
    ...Sequence.range(1, inp.height).filter((r) => !rows.has(r)),
  ];
  const emptyCols = [
    ...Sequence.range(1, inp.width).filter((c) => !cols.has(c)),
  ];
  const expanded = inp.locs.map<Location>((loc) => {
    return {
      line: loc.line +
        (emptyRows.filter((x) => loc.line > x).length * expansion),
      column: loc.column +
        (emptyCols.filter((x) => loc.column > x).length * expansion),
    };
  });
  let total = 0;
  for (const [a, b] of new Sequence(expanded).combinations(2)) {
    total += Math.abs(a.line - b.line) + Math.abs(a.column - b.column);
  }

  return total;
}

function part1(inp: Input): number {
  return expandedDistance(inp, 1);
}

function part2(inp: Input): number {
  return expandedDistance(inp, 999999);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input>(args);
  return [part1(inp), part2(inp)];
}
