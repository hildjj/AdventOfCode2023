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

  toString(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }
}

class Block {
  begin: Point;
  end: Point;
  restsOn: Block[] = [];
  supports: Block[] = [];

  constructor(begin: Point, end: Point) {
    this.begin = begin;
    this.end = end;
  }

  *[Symbol.iterator](): Generator<
    [x: number, y: number, z: number],
    undefined,
    undefined
  > {
    for (let x = this.lowX; x <= this.highX; x++) {
      for (let y = this.lowY; y <= this.highY; y++) {
        for (let z = this.lowZ; z <= this.highZ; z++) {
          yield [x, y, z];
        }
      }
    }
  }

  get cells(): Set<string> {
    const ret = new Set<string>();
    for (const [x, y, z] of this) {
      ret.add(new Point(x, y, z).toString());
    }
    return ret;
  }

  get diffs(): [x: number, y: number, z: number] {
    return [
      Math.abs(this.begin.x - this.end.x),
      Math.abs(this.begin.y - this.end.y),
      Math.abs(this.begin.z - this.end.z),
    ];
  }

  intersect(cells: Map<string, Block>): Block[] {
    const ret: Block[] = [];
    for (const c of this.cells.values()) {
      const b = cells.get(c);
      if (b) {
        ret.push(b);
      }
    }
    return ret;
  }

  add(cells: Map<string, Block>): void {
    for (const c of this.cells.values()) {
      cells.set(c, this);
    }
  }

  get length(): number {
    const [dx, dy, dz] = this.diffs;
    return dx + dy + dz + 1;
  }

  get lowX(): number {
    return Math.min(this.begin.x, this.end.x);
  }

  get highX(): number {
    return Math.max(this.begin.x, this.end.x);
  }

  get lowY(): number {
    return Math.min(this.begin.y, this.end.y);
  }

  get highY(): number {
    return Math.max(this.begin.y, this.end.y);
  }

  get lowZ(): number {
    return Math.min(this.begin.z, this.end.z);
  }

  get highZ(): number {
    return Math.max(this.begin.z, this.end.z);
  }

  lower(): void {
    this.begin.z--;
    this.end.z--;
  }

  raise(): void {
    this.begin.z++;
    this.end.z++;
  }

  toString(): string {
    return `${this.begin}->${this.end}(${this.length})`;
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }
}

function settle(inp: Input[]): Block[] {
  const blocks = inp.map(([from, to]) =>
    new Block(new Point(...from), new Point(...to))
  );

  blocks.sort((a, b) => a.lowZ - b.lowZ);
  const done = new Map<string, Block>();

  for (const b of blocks) {
    if (b.lowZ === 1) {
      b.add(done);
    } else {
      let int = b.intersect(done);
      while (!int.length && (b.lowZ > 1)) {
        b.lower();
        int = b.intersect(done);
      }
      if (int.length) {
        for (const i of new Set(int).values()) {
          b.restsOn.push(i);
          i.supports.push(b);
        }
        b.raise();
      }
      b.add(done);
    }
  }
  return blocks;
}

function part1(inp: Input[]): number {
  const blocks = settle(inp);

  return blocks.filter((b) =>
    b.supports.filter((s) => s.restsOn.length === 1).length === 0
  ).length;
}

function part2(inp: Input[]): number {
  const blocks = settle(inp);
  let count = 0;

  for (const b of blocks) {
    const pending = [...b.supports];
    const falling = new Set<string>([b.toString()]);

    while (pending.length) {
      const cur = pending.shift();
      if (cur?.restsOn.every((o) => falling.has(o.toString()))) {
        falling.add(cur.toString());
        pending.push(...cur.supports);
      }
    }
    count += falling.size - 1;
  }

  return count;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input[]>(args);
  return [part1(inp), part2(inp)];
}
