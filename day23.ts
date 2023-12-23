import { AllDirs, CARDINAL, Dir, Point, Rect } from './lib/rect.ts';
import { type MainArgs, readAllLines } from './lib/utils.ts';
import { BinaryHeap } from '$std/data_structures/binary_heap.ts';
import { Graph } from './graph/graph.ts';

interface Path {
  p: Point;
  dir: Dir;
  len: number;
  fScore: number;
  parent: Path | undefined;
}

const slopes: Record<string, Dir> = {
  '^': Dir.N,
  '>': Dir.E,
  'v': Dir.S,
  '<': Dir.W,
};

type DxDy = Record<string, [dx: number, dy: number][]>;
const PossibleDirs: DxDy = {
  '^': [[0, -1]],
  '>': [[1, 0]],
  'v': [[0, 1]],
  '<': [[-1, 0]],
  '.': Point.CARDINAL,
  '#': [],
};

const AllPossibleDirs: DxDy = {
  '^': Point.CARDINAL,
  '>': Point.CARDINAL,
  'v': Point.CARDINAL,
  '<': Point.CARDINAL,
  '.': Point.CARDINAL,
  '#': [],
};

type MyGraph = Graph<Point, number, string>;

function dfs(
  graph: MyGraph,
  startNodeId: string,
  endNodeId: string,
  seen: Set<string>,
): number {
  if (startNodeId === endNodeId) {
    return 0;
  }
  let m = -Infinity;
  seen.add(startNodeId);
  for (const [_a, link, b] of graph.linkedNodes(startNodeId, true)) {
    // Don't backtrack, or loop around to another place we've been before
    // on this path.
    if (!seen.has(b.id)) {
      m = Math.max(m, dfs(graph, b.id, endNodeId, seen) + link.data!);
    }
  }
  seen.delete(startNodeId);
  return m;
}

function findNodes(r: Rect<string>, g: MyGraph): void {
  for (const [q, val] of r.entries()) {
    if (val === '#') {
      continue;
    }
    // Find all points where there is more than one choice.
    // These are the candidate points that go in the graph.
    if (q.cardinal(r).filter((p) => r.get(p) !== '#').length >= 3) {
      g.addNode(q.toString(), q);
    }
  }
}

function addPathLinks(r: Rect<string>, g: MyGraph, possibleDirs: DxDy): void {
  // For each node, find the path length to each adjacent node
  for (const n of g.nodes()) {
    const start = n.data!;
    const stack: [point: Point, len: number][] = [[start, 0]];
    const seen = new Set<string>([start.toString()]);

    let q: [point: Point, len: number] | undefined;
    while ((q = stack.pop())) {
      const [p, len] = q;
      if (len !== 0) {
        const o = g.getNode(p.toString());
        if (o) {
          g.addLink(n.id, o.id, len);
          continue;
        }
      }
      for (const [dx, dy] of possibleDirs[r.get(p)]) {
        const c = p.xlate(dx, dy);
        if (!r.check(c)) {
          continue;
        }
        const cs = c.toString();
        if (seen.has(cs)) {
          continue;
        }
        seen.add(cs);
        stack.push([c, len + 1]);
      }
    }
  }
}

function part1(inp: string[][]): number {
  const r = new Rect(inp);
  // Note: there are no dead ends to prune in the input.
  const p = new Point(r.rows()[0].findIndex((v) => v !== '#'), 0);
  const target = new Point(
    r.rows()[r.height - 1].findIndex((v) => v !== '#'),
    r.height - 1,
  );

  const pq = new BinaryHeap<Path>((a, b) => b.fScore - a.fScore);
  pq.push({
    p,
    dir: Dir.S,
    len: 0,
    fScore: 0,
    parent: undefined,
  });

  let cur: Path | undefined;
  const seen = new Set<string>();
  const dist = new Map<string, number>();
  while ((cur = pq.pop())) {
    const q = cur.p.inDir(cur.dir);
    const qs = q.toString();

    if (seen.has(qs)) {
      continue;
    }
    seen.add(qs);
    if (!r.check(q)) {
      continue;
    }

    if ((dist.get(qs) ?? 0) > cur.len) {
      continue;
    }
    dist.set(qs, cur.len);

    const cell = r.get(q);
    switch (cell) {
      case '#':
        continue;
      case '.':
        break;
      default:
        if (slopes[cell] !== cur.dir) {
          continue;
        }
        break;
    }

    if (q.equals(target)) {
      const res = cur.len + 1;
      const t = r.copy();
      while (cur) {
        t.set(cur.p, 'O');
        cur = cur.parent;
      }
      return res;
    }

    for (const dir of AllDirs) {
      pq.push({
        p: q,
        dir,
        len: cur.len + 1,
        fScore: cur.len,
        // fScore: cur.len + q.manhattan(target),
        parent: cur,
      });
    }
  }

  return NaN;
}

function part2(inp: string[][]): number {
  const r = new Rect(inp);
  const p = new Point(r.rows()[0].findIndex((v) => v !== '#'), 0);
  const target = new Point(
    r.rows()[r.height - 1].findIndex((v) => v !== '#'),
    r.height - 1,
  );
  const g = new Graph<Point, number, string>();
  g.addNode(p.toString(), p);
  g.addNode(target.toString(), target);

  findNodes(r, g);
  addPathLinks(r, g, AllPossibleDirs);

  // Do a depth-first search of the nodes, finding the max len
  return dfs(g, p.toString(), target.toString(), new Set<string>());
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = (await readAllLines(args)).map((x) => x.split(''));
  return [part1(inp), part2(inp)];
}
