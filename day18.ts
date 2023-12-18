import { type MainArgs, parseFile } from './lib/utils.ts';

interface Input {
  dir: string;
  len: number;
  color?: string;
}

const cardinal: Record<string, [number, dy: number]> = {
  U: [0, -1],
  R: [1, 0],
  D: [0, 1],
  L: [-1, 0],
};

const DIR: Record<string, string> = { 0: 'R', 1: 'D', 2: 'L', 3: 'U' };

function area(inp: Input[]): number {
  let tot = 0;
  const times = inp.length - 1;
  let x = 0;
  let y = 0;
  let prevX = 0;
  let prevY = 0;
  let perim = 0;
  for (let i = 0; i < times; i++) {
    const [dx, dy] = cardinal[inp[i].dir];
    perim += inp[i].len;
    x += dx * inp[i].len;
    y += dy * inp[i].len;
    tot += (prevY + y) * (prevX - x); // Shoelace
    prevX = x;
    prevY = y;
  }
  perim += x + y;
  tot += y * x;
  tot /= 2;
  return tot + 1 - (perim / 2) + perim; // Pick's.
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
