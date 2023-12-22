import { type MainArgs, parseFile } from './lib/utils.ts';

type Input = [
  [x: number, y: number, z: number],
  [x: number, y: number, z: number],
];

class Point {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  below(): Point {
    return new Point(this.x, this.y, this.z - 1);
  }

  toString(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }
}

function asc(a: number, b: number): number {
  return a - b;
}

class Block {
  begin: Point;
  end: Point;
  restsOn: Block[] = [];
  supports: Block[] = [];
  lowX: number;
  highX: number;
  lowY: number;
  highY: number;
  lowZ: number;
  highZ: number;

  constructor(begin: Point, end: Point) {
    this.begin = begin;
    this.end = end;
    [this.lowX, this.highX] = [begin.x, end.x].sort(asc);
    [this.lowY, this.highY] = [begin.y, end.y].sort(asc);
    [this.lowZ, this.highZ] = [begin.z, end.z].sort(asc);
  }

  *[Symbol.iterator](): Generator<
    Point,
    undefined,
    undefined
  > {
    for (let x = this.lowX; x <= this.highX; x++) {
      for (let y = this.lowY; y <= this.highY; y++) {
        for (let z = this.lowZ; z <= this.highZ; z++) {
          yield new Point(x, y, z);
        }
      }
    }
  }

  intersect(cells: Map<string, Block>): Block[] {
    const ret: Block[] = [];
    for (const c of this) {
      const b = cells.get(c.below().toString());
      if (b) {
        ret.push(b);
      }
    }
    return ret;
  }

  add(cells: Map<string, Block>): void {
    for (const c of this) {
      cells.set(c.toString(), this);
    }
  }

  lower(): void {
    this.begin.z--;
    this.end.z--;
    this.lowZ--;
    this.highZ--;
  }

  toString(): string {
    return `${this.begin}->${this.end}`;
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }
}

function settle(inp: Input[]): Block[] {
  const blocks = inp.map(([from, to]) =>
    new Block(new Point(...from), new Point(...to))
  );

  // If we lower the already-lowest first, there will be no collisions
  // while falling.
  blocks.sort((a, b) => a.lowZ - b.lowZ);
  const done = new Map<string, Block>();

  for (const b of blocks) {
    if (b.lowZ === 1) {
      b.add(done);
    } else {
      let int = b.intersect(done);

      // Lower the block until we would hit another block or be on the floor
      // if lowered again.
      while (!int.length && (b.lowZ > 2)) {
        b.lower();
        int = b.intersect(done);
      }
      if (int.length) {
        // Might intersect the same block more than once.
        for (const i of new Set(int).values()) {
          b.restsOn.push(i);
          i.supports.push(b);
        }
      } else {
        b.lower();
      }
      b.add(done);
    }
  }
  return blocks;
}

function part1(blocks: Block[]): number {
  // Every block that doesn't have something that is resting on it, and only
  // it.
  return blocks.filter((b) =>
    b.supports.filter((s) => s.restsOn.length === 1).length === 0
  ).length;
}

function part2(blocks: Block[]): number {
  let count = 0;

  for (const b of blocks) {
    // Start this block falling
    const falling = new Set<string>([b.toString()]);
    // Everything that it supports might start falling too.
    const pending = [...b.supports];

    let cur: Block | undefined;
    while ((cur = pending.shift())) {
      // If everything I'm on is falling, so am I.
      if (cur.restsOn.every((o) => falling.has(o.toString()))) {
        falling.add(cur.toString());
        pending.push(...cur.supports);
      }
    }
    count += falling.size - 1; // Don't count the original
  }

  return count;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input[]>(args);
  const blocks = settle(inp);
  return [part1(blocks), part2(blocks)];
}
