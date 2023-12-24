import { type MainArgs, parseFile } from './lib/utils.ts';
import { Sequence } from './lib/sequence.ts';
import { $ } from '$dax';

type Point3 = [x: number, y: number, z: number];
type Input = [pos: Point3, vel: Point3];

class Point {
  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;
  m: number;
  b: number;

  constructor(inp: Input) {
    [this.px, this.py, this.pz] = inp[0];
    [this.vx, this.vy, this.vz] = inp[1];
    this.m = this.vy / this.vx;
    this.b = this.py - (this.m * this.px);
  }
}

// const min = 7;
// const max = 27;
const min = 200000000000000;
const max = 400000000000000;

function part1(inp: Input[]): number {
  const points = inp.map((i) => new Point(i));
  const intersects = new Sequence(points)
    .combinations(2)
    .filter(([a, b]) => a.m !== b.m)
    .map(([a, b]) => {
      // ax+c = bx+d
      // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
      const px = (b.b - a.b) / (a.m - b.m);
      const py = (a.m * px) + a.b;
      const t1 = (px - a.px) / a.vx;
      const t2 = (px - b.px) / b.vx;
      // console.log(a.name, b.name, px, py, t1, t2);
      return [px, py, t1, t2];
    })
    .filter(([x, y, t1, t2]) =>
      t1 > 0 && t2 > 0 && x >= min && x <= max && y >= min && y <= max
    )
    .toArray();
  // console.log(intersects);
  return intersects.length;
}

async function part2(): Promise<number> {
  // Massive hack: Step out to python to get z3 to work.
  const res = await $`python day24.py`.text();
  return Number(res);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input[]>(args);
  return [part1(inp), await part2()];
}
