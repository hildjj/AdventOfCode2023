import { type MainArgs, readAllLines } from './utils.ts';
import { Rect } from './rect.ts';

enum Dir {
  Up,
  Right,
  Down,
  Left,
}

const xlate: Record<Dir, [dx: number, dy: number]> = {
  [Dir.Up]: [0, -1],
  [Dir.Right]: [1, 0],
  [Dir.Down]: [0, 1],
  [Dir.Left]: [-1, 0],
};

const reflectSlash: Record<Dir, Dir> = {
  [Dir.Up]: Dir.Right,
  [Dir.Right]: Dir.Up,
  [Dir.Down]: Dir.Left,
  [Dir.Left]: Dir.Down,
};

const reflectBackslash: Record<Dir, Dir> = {
  [Dir.Up]: Dir.Left,
  [Dir.Right]: Dir.Down,
  [Dir.Down]: Dir.Right,
  [Dir.Left]: Dir.Up,
};

class Beam {
  r: Rect;
  x: number;
  y: number;
  dir: Dir;

  constructor(r: Rect, x: number, y: number, dir: Dir) {
    this.r = r;
    this.x = x;
    this.y = y;
    this.dir = dir;
  }

  check(): boolean {
    return (this.x >= 0) && (this.y >= 0) &&
      (this.x < this.r.width) && (this.y < this.r.height);
  }

  go(): this {
    const [dx, dy] = xlate[this.dir];
    this.x += dx;
    this.y += dy;
    return this;
  }

  copy(dir?: Dir): Beam {
    return new Beam(this.r, this.x, this.y, dir ?? this.dir);
  }

  get cell(): string {
    return this.r.get(this.x, this.y);
  }

  pos(): string {
    return `${this.x},${this.y}`;
  }

  toString(): string {
    return `${this.x},${this.y},${this.dir}`;
  }
}

function energize(init: Beam): number {
  let beams: Beam[] = [init];
  const energized = new Set<string>();
  const seen = new Set<string>();

  while (beams.length) {
    // Don't modify beams while filtering
    const extra: Beam[] = [];
    beams = beams.filter((b) => {
      const key = b.toString();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      energized.add(b.pos());
      switch (b.cell) {
        case '.':
          // No-op, keep going
          break;
        case '|':
          if (b.dir === Dir.Left || b.dir === Dir.Right) {
            // This one goes up
            b.dir = Dir.Up;
            // New one down
            const c = b.copy(Dir.Down).go();
            if (c.check()) {
              extra.push(c);
            }
          }
          break;
        case '-':
          if (b.dir === Dir.Up || b.dir === Dir.Down) {
            // This one goes left
            b.dir = Dir.Left;
            // New one right
            const c = b.copy(Dir.Right).go();
            if (c.check()) {
              extra.push(c);
            }
          }
          break;
        case '/':
          b.dir = reflectSlash[b.dir];
          break;
        case '\\':
          b.dir = reflectBackslash[b.dir];
          break;
        default:
          throw new Error(`Invalid cell: ${b.cell}`);
      }
      return b.go().check();
    });
    beams = beams.concat(extra);
  }

  return energized.size;
}

function part1(inp: Rect<string>): number {
  return energize(new Beam(inp, 0, 0, Dir.Right));
}

function part2(inp: Rect<string>): number {
  let max = -Infinity;
  for (let x = 0; x < inp.width; x++) {
    max = Math.max(
      max,
      energize(new Beam(inp, x, 0, Dir.Down)),
      energize(new Beam(inp, x, inp.height - 1, Dir.Down)),
    );
  }
  for (let y = 0; y < inp.height; y++) {
    max = Math.max(
      max,
      energize(new Beam(inp, 0, y, Dir.Right)),
      energize(new Beam(inp, inp.width - 1, y, Dir.Left)),
    );
  }

  return max;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = new Rect((await readAllLines(args)).map((r) => r.split('')));
  return [part1(inp), part2(inp)];
}
