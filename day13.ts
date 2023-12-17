import { type MainArgs, parseFile } from './lib/utils.ts';

function checkReflection(r: number[], row: number): boolean {
  for (let i = 0; (row + i < r.length) && (row - i - 1 >= 0); i++) {
    if (r[row + i] !== r[row - i - 1]) {
      return false;
    }
  }
  return true;
}

function transpose(p: Uint8Array[]): Uint8Array[] {
  const w = p[0].length;
  const h = p.length;
  const res = Array.from(new Array(w), () => new Uint8Array(h));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < p[y].length; x++) {
      res[x][y] = p[y][x];
    }
  }
  return res;
}

function findReflection(r: number[], not: number): number | null {
  // find every time there are two rows with the same value in a row.
  let prev = NaN;
  for (let i = 0; i < r.length; i++) {
    const s = r[i];

    // not: keep going past a previously good answer.
    if ((s === prev) && (i !== not)) {
      if (checkReflection(r, i)) {
        return i;
      }
    }
    prev = s;
  }
  return null;
}

function toNums(p: Uint8Array[]): number[] {
  return p.map((x) => Number(`0b${x.join('')}`));
}

function findReflectionExcept(p: Uint8Array[], not: number): number | null {
  const bia = toNums(p);
  const j = findReflection(bia, not / 100); // NaN pollution intended
  if (j) {
    return j * 100;
  }
  const tia = toNums(transpose(p));
  return findReflection(tia, not);
}

function part1(inp: Uint8Array[][]): number {
  let tot = 0;
  for (const p of inp) {
    const weighted = findReflectionExcept(p, NaN);
    if (!weighted) {
      throw new Error(`Invalid pattern: ${p}`);
    }
    tot += weighted;
  }
  return tot;
}

// Return a modified copy of p, with one bit at (x,y) flipped.
function flip(p: Uint8Array[], x: number, y: number): Uint8Array[] {
  const q = structuredClone(p);
  q[y][x] ^= 1;
  return q;
}

function part2(inp: Uint8Array[][]): number {
  let tot = 0;
  OUTER:
  for (const p of inp) {
    const o = findReflectionExcept(p, NaN)!;
    // For
    for (let y = 0; y < p.length; y++) {
      for (let x = 0; x < p[y].length; x++) {
        const q = flip(p, x, y);
        const qo = findReflectionExcept(q, o);
        if (qo) {
          tot += qo;
          continue OUTER;
        }
      }
    }
    throw new Error(`Not found:\n${p.map((x) => x.join('')).join('\n')}`);
  }
  return tot;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Uint8Array[][]>(args);
  return [part1(inp), part2(inp)];
}
