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
  callbackFn: (char: string, x: number, y: number, d: number) => void,
): void {
  let line = start.line - 1;
  let col = start.column - 1;

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

function part1(inp: Input): number {
  const r = new Rect(inp.cells);
  let len = 1;
  chase(r, inp.start, () => len++);
  return len / 2;
}

function part2(inp: Input): number {
  const r = new Rect(inp.cells);
  const state = r.map(() => '.');

  state.set(inp.start.column - 1, inp.start.line - 1, 'P');
  chase(r, inp.start, (char, x, y) => {
    switch (char) {
      case 'J':
      case 'F':
      case '|':
      case '-':
        // Pipe crossing
        state.set(x, y, 'P');
        break;
      case '7':
      case 'L':
        // Pipe, but not a crossing, because this is an outside corner
        // when seen from a down/right diagnoal ray
        state.set(x, y, 'N');
        break;
      case '.':
        // no-op
        break;
      default:
        throw new Error(`Invalid state: ${char}`);
    }
  });

  // Approach: Raycast from the top and left edges
  // Odd = inside
  // Even = outside
  // See: https://en.wikipedia.org/wiki/Point_in_polygon
  // Shape is "simple" in that there are no pipe crossings

  let count = 0;

  function ray(x: number, y: number): void {
    // Diagonal line, down and right from x/y, counting line crossings.
    // Diagonal lines don't have to worry about complex rules for
    // horizontal or vertical lines.
    let cross = false;
    while (y < state.height && x < state.width) {
      switch (state.get(x, y)) {
        case '.':
          if (cross) {
            count++;
            state.set(x, y, 'I');
          } else {
            state.set(x, y, ' ');
          }
          break;
        case 'P':
          state.set(x, y, '+');
          cross = !cross;
          break;
        case 'N':
          // outside corner.  No-op
          state.set(x, y, '-');
          break;
        default:
          // Make sure we don't run the same diagonal twice
          throw new Error('Unknown state');
      }
      x++;
      y++;
    }
  }

  // Top edge
  for (let x = 0; x < state.width; x++) {
    ray(x, 0);
  }

  // Left edge
  for (let y = 1; y < state.height; y++) {
    ray(0, y);
  }

  // Purty
  // console.log(state);
  return count;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input>(args);
  return [part1(inp), part2(inp)];
}
