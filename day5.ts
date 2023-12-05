import { type MainArgs, Utils } from './utils.ts';
import { Sequence } from './sequence.ts';

type MapName = [from: string, to: string];
interface Range {
  dest: number;
  src: number;
  len: number;
}
type Mapping = [name: MapName, Range[]];
type Almanac = [seeds: number[], mappings: Mapping[]]

function rangeMap(n: number, ranges: Range[]): number {
  for (const {dest, src, len} of ranges) {
    if ((n >= src) && (n < src + len)) {
      return dest + (n - src);
    }
  }
  return n;
}

function part1(inp: Almanac): number {
  let nums = inp[0];
  let type = 'seed';
  while (true) {
    const map = inp[1].find(n => n[0][0] === type);
    if (!map) {
      break;
    }
    type = map[0][1];
    nums = nums.map(n => rangeMap(n, map[1]))
  }
  return Math.min(...nums);
}

type InputRange = [number, number];
function splitRanges(i: InputRange, ranges: Range[]): InputRange[] {
  // ranges is sorted on src, and src always starts at 0.  May be gaps.
  const res: InputRange[] = [];
  let [start, count] = i;

  for (const r of ranges) {
    const endSrc = r.src + r.len;
    const endInp = start + count;
    if ((start >= r.src) && (start < endSrc)) {
      // Some overlap at the beginning
      if (endInp <= endSrc) {
        // Full overlap
        // r.src start endInp endSrc
        res.push([r.dest + (start - r.src), count]);
        count = 0;
        break;
      } else {
        // r.src start endSrc endInp
        res.push([r.dest + (start - r.src), endSrc - start]);
        start = endSrc;
        count = endInp - endSrc;
      }
    } else if ((endInp >= r.src) && (endInp <= endSrc)) {
      // Some overlap at end
      res.push([start, r.src - start]); // No mapping found for first chunk
      if (endInp <= endSrc) {
        // start r.src endInp endSrc
        res.push([r.dest, endSrc - endInp]);
        count = 0;
        break;
      } else {
        // start r.src endSrc endInp
        res.push([r.dest, r.len]);
        start = endSrc;
        count = endInp - endSrc;
      }
    }
  }
  if (count > 0) {
    // Leftovers
    res.push([start, count]);
  }
  return res;
}

function part2(inp: Almanac): number {
  // This is going to be an expanding list of [start, len] pairs.
  // We will split each range up as needed when we range map;
  let ranges = [...new Sequence<number>(inp[0]).chunks(2)] as InputRange[];

  let type = 'seed';
  while (true) {
    // console.log(type, ranges)
    const map = inp[1].find(n => n[0][0] === type);
    if (!map) {
      break;
    }
    type = map[0][1];
    const nextRanges: InputRange[] = [];
    for (const ir of ranges) {
      nextRanges.push(...splitRanges(ir, map[1]));
    }
    ranges = nextRanges;
  }
  ranges.sort((a, b) => a[0] - b[0]);
  return Math.min(...ranges.map(([start]) => start));
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await Utils.parseFile<Almanac>(args);
  for (const m of inp[1]) {
    m[1].sort((a, b) => a.src - b.src);
    if (m[1][0].src !== 0) {
      m[1].unshift({dest: 0, src: 0, len: m[1][0].src - 1})
    }
  }
  return [part1(inp), part2(inp)];
}
