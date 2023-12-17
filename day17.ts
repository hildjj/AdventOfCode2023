import { type MainArgs, readAllLines } from './lib/utils.ts';
import { Rect } from './lib/rect.ts';
import { BinaryHeap } from '$std/data_structures/binary_heap.ts';

enum Dir {
  Up,
  Right,
  Down,
  Left,
}

const opposite: Record<Dir, Dir> = {
  [Dir.Up]: Dir.Down,
  [Dir.Right]: Dir.Left,
  [Dir.Down]: Dir.Up,
  [Dir.Left]: Dir.Right,
};

const cardinal: [dir: Dir, dx: number, dy: number][] = [
  [Dir.Up, 0, -1],
  [Dir.Right, 1, 0],
  [Dir.Down, 0, 1],
  [Dir.Left, -1, 0],
];

interface State {
  fScore: number;
  energy: number;
  x: number;
  y: number;
  dir: Dir;
  dirCount: number;
  parent?: State;
}

function find(
  inp: number[][],
  cond: (a: number, b: number) => boolean,
): number {
  const r = new Rect(inp);
  const [targetX, targetY] = [r.width - 1, r.height - 1];
  const visited = new Map<number, number>();
  const openSet = new BinaryHeap<State>((a, b) => a.fScore - b.fScore);

  openSet.push({
    fScore: 0,
    energy: 0,
    x: 0,
    y: 0,
    dir: Dir.Right,
    dirCount: 0,
  });
  openSet.push({
    fScore: 0,
    energy: 0,
    x: 0,
    y: 0,
    dir: Dir.Down,
    dirCount: 0,
  });

  while (openSet.length) {
    const cur = openSet.pop()!;

    // Found goal?
    if (
      (cur.x === targetX) && (cur.y === targetY) &&
      cond(cur.dirCount, cur.dirCount)
    ) {
      // Print path
      // const view = r.map(() => '.');
      // for (const k of visited.keys()) {
      //   const x = (k & 0xff00) >> 8;
      //   const y = k & 0xff;
      //   view.set(x, y, ' ');
      // }
      // let p: State | undefined = cur;
      // while (p) {
      //   view.set(p.x, p.y, ['^', '>', 'V', '<'][p.dir]!);
      //   p = p.parent;
      // }
      // console.log(view.toString());
      // console.log();
      return cur.energy;
    }

    for (const [dir, dx, dy] of cardinal) {
      if (dir === opposite[cur.dir]) {
        continue;
      }
      const [x, y] = [cur.x + dx, cur.y + dy];
      const dirCount = (cur.dir === dir) ? cur.dirCount + 1 : 1;
      if (!r.check(x, y) || !cond(cur.dirCount, dirCount)) {
        continue;
      }
      // Munge all state into a Uint32
      const key = dirCount << 20 | dir << 16 | x << 8 | y;
      const prev = visited.get(key) ?? Infinity;
      const energy = cur.energy + r.get(x, y);
      if (energy >= prev) {
        continue;
      }
      visited.set(key, energy);
      openSet.push({
        fScore: energy + (targetX - x) + (targetY - y),
        energy,
        x,
        y,
        dir,
        dirCount,
        // Put this back in to generate visuals
        // parent: cur,
      });
    }
  }

  return NaN;
}

function part1(inp: number[][]): number {
  return find(inp, (_a: number, b: number) => b < 4);
}

function part2(inp: number[][]): number {
  // We want the count to be between 4 and 10, but if less than four,
  // we prefer longer runs in order to get to 4.
  return find(inp, (a: number, b: number) => (a >= 4 || b > a) && (b <= 10));
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = (await readAllLines(args)).map((x) => x.split('').map(Number));
  return [part1(inp), part2(inp)];
}
