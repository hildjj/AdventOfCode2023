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
  energy: number;
  fScore: number;
  x: number;
  y: number;
  dir: Dir;
  dirCount: number;
}

function find(
  inp: number[][],
  cond: (a: number, b: number) => boolean,
): number {
  const r = new Rect(inp);
  const [targetX, targetY] = [r.width - 1, r.height - 1];
  const visited: Record<string, number> = {};

  const openSet = new BinaryHeap<State>((a, b) => a.fScore - b.fScore);

  openSet.push({
    energy: 0,
    fScore: 0,
    x: 0,
    y: 0,
    dir: Dir.Right,
    dirCount: 0,
  });
  openSet.push({
    energy: 0,
    fScore: 0,
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
      return cur.energy;
    }

    for (
      const [dir, dx, dy] of cardinal.filter((
        [dir],
      ) => (dir !== opposite[cur!.dir]))
    ) {
      const [x, y] = [cur.x + dx, cur.y + dy];
      const dirCount = (cur.dir === dir) ? cur.dirCount + 1 : 1;
      if (!r.check(x, y) || !cond(cur.dirCount, dirCount)) {
        continue;
      }
      const energy = cur.energy + r.get(x, y);
      const key = [x, y, dir, dirCount].join(',');
      const prev = visited[key] ?? Infinity;
      if (energy >= prev) {
        continue;
      }
      visited[key] = energy;
      openSet.push({
        energy,
        fScore: energy + (targetX - x) + (targetY - y),
        x,
        y,
        dir,
        dirCount,
      });
    }
  }

  return NaN;
}

function part1(inp: number[][]): number {
  return find(inp, (_a: number, b: number) => b < 4);
}

function part2(inp: number[][]): number {
  return find(inp, (a: number, b: number) => (b > a || a >= 4) && (b < 11));
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = (await readAllLines(args)).map((x) => x.split('').map(Number));
  return [part1(inp), part2(inp)];
}
