import { type MainArgs, parseFile } from './lib/utils.ts';
import { Point } from './lib/rect.ts';

interface Input {
  dir: string;
  len: number;
  color?: string;
}

const cardinal: Record<string, Point> = {
  U: new Point(0, -1),
  R: new Point(1, 0),
  D: new Point(0, 1),
  L: new Point(-1, 0),
};

const DIR: Record<string, string> = { 0: 'R', 1: 'D', 2: 'L', 3: 'U' };

function area(inp: Input[]): number {
  let area = 0;
  let perim = 0;
  let cur = new Point(0, 0);
  for (const { dir, len } of inp) {
    perim += len;
    const prev = cur;
    cur = prev.xlate(cardinal[dir].stretch(len));
    area += (prev.y + cur.y) * (prev.x - cur.x); // Shoelace
  }
  // Close up to 0, 0
  perim += cur.x + cur.y;
  area += cur.y * cur.x;
  area /= 2; // End of shoelace
  return area + 1 - (perim / 2) + // Pick's.
    perim; // Add in the edge
}

function part1(inp: Input[]): number {
  return area(inp);
}

function part2(inp: Required<Input>[]): number {
  return area(inp.map<Input>(({ color }) => ({
    len: parseInt(color.slice(0, 5), 16),
    dir: DIR[color[5]],
  })));
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Required<Input>[]>(args);
  return [part1(inp), part2(inp)];
}
