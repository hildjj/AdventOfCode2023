import { type MainArgs, parseFile } from './utils.ts';
import { Rect } from './rect.ts';

interface Location {
  line: number;
  column: number;
}

//  1
// 2 3
//  4
type Direction = 1 | 2 | 3 | 4;
type NextCell = [dx: number, dy: number, entrypoint: Direction];
type NextMap = Partial<Record<Direction, NextCell>>;
type Pipe = '|' | '-' | 'L' | 'J' | '7' | 'F' | '.' | 'S';

const DIRS: Record<Pipe, NextMap> = {
  // is a vertical pipe connecting north and south.
  '|': { 1: [0, 1, 1], 4: [0, -1, 4] },
  // is a horizontal pipe connecting east and west.
  '-': { 2: [1, 0, 2], 3: [-1, 0, 3] },
  // is a 90-degree bend connecting north and east.
  'L': { 1: [1, 0, 2], 3: [0, -1, 4] },
  // is a 90-degree bend connecting north and west.
  'J': { 1: [-1, 0, 3], 2: [0, -1, 4] },
  // is a 90-degree bend connecting south and west.
  '7': { 2: [0, 1, 1], 4: [-1, 0, 3] },
  // is a 90-degree bend connecting south and east.
  'F': { 3: [0, 1, 1], 4: [1, 0, 2] },
  // is ground; there is no pipe in this tile.
  '.': {},
  // is the starting position of the animal; there is a pipe on this tile, but
  // your sketch doesn't show what shape the pipe has.
  'S': {},
};

const CARDINAL: NextCell[] = [
  [-1, 0, 3], // Left
  [1, 0, 2], // Right
  [0, -1, 4], // Up
  [0, 1, 1], // Down
];

interface Input {
  start: Location;
  cells: Pipe[][];
}

function chase(
  r: Rect<Pipe>,
  start: Location,
  callbackFn: (char: string, x: number, y: number, d: Direction) => void,
): void {
  let line = start.line - 1;
  let col = start.column - 1;

  // Get the first match.  Clockwise vs. anti- doesn't matter.
  let [x, y, d] = CARDINAL.find(([x, y, d]) =>
    DIRS[r.get(col, line, x, y)][d]
  )!;

  line += y;
  col += x;

  let char = r.get(col, line);
  do {
    callbackFn(char, col, line, d);
    [x, y, d] = DIRS[char][d]!;
    line += y;
    col += x;
    char = r.get(col, line);
  } while (char !== 'S');
}

function parts(inp: Input): [number, number] {
  // This is clearly the intended algorithm, based on part 1's clever need
  // to divide the path length by 2.
  const r = new Rect(inp.cells);

  // Find the area using the Shoelace formula, trapezoid style:
  // https://en.wikipedia.org/wiki/Shoelace_formula
  let area = 0;
  let count = 1;
  let first = true;
  let x0 = NaN;
  let y0 = NaN;
  let px = NaN; // Prev
  let py = NaN;
  chase(r, inp.start, (_char, x, y) => {
    if (first) {
      first = false;
      x0 = x;
      y0 = y;
    } else {
      area += (py + y) * (px - x);
    }
    px = x;
    py = y;
    count++;
  });
  area += (py + y0) * (px - x0); // Close the loop
  area /= 2;
  count /= 2;

  // Now, Pick's theorem to get the number of points:
  // https://en.wikipedia.org/wiki/Pick%27s_theorem
  return [count, area - count + 1];
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input>(args);
  return parts(inp);
}
