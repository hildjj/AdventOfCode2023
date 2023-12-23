import { Dir, Point, Rect } from './lib/rect.ts';
import { type MainArgs, readAllLines } from './lib/utils.ts';
import { Graph } from './graph/graph.ts';

interface Path {
  p: Point;
  dir: Dir;
  len: number;
  fScore: number;
  parent: Path | undefined;
}

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
          // Don't keep going past an adjacent node
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

function run(inp: string[][], possibleDirs: DxDy): number {
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
  addPathLinks(r, g, possibleDirs);

  // Do a depth-first search of the nodes, finding the max len
  return dfs(g, p.toString(), target.toString(), new Set<string>());
}

function part1(inp: string[][]): number {
  return run(inp, PossibleDirs);
}

function part2(inp: string[][]): number {
  return run(inp, AllPossibleDirs);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = (await readAllLines(args)).map((x) => x.split(''));
  return [part1(inp), part2(inp)];
}
