import { type MainArgs, parseFile } from './utils.ts';

enum Dir {
  N,
  W,
  S,
  E,
}

function tilt(inp: string[][], dir: Dir): void {
  // TODO(hildjj): De-dup these.
  switch (dir) {
    case Dir.N:
      for (let row = 1; row < inp.length; row++) {
        for (let col = 1; col < inp[row].length; col++) {
          if (inp[row][col] === 'O') {
            for (let drop = row - 1; drop > 0; drop--) {
              if (inp[drop][col] === '.') {
                inp[drop][col] = 'O';
                inp[drop + 1][col] = '.';
              } else {
                break;
              }
            }
          }
        }
      }
      break;
    case Dir.W:
      for (let col = 1; col < inp[0].length; col++) {
        for (let row = 1; row < inp.length; row++) {
          if (inp[row][col] === 'O') {
            for (let drop = col - 1; drop > 0; drop--) {
              if (inp[row][drop] === '.') {
                inp[row][drop] = 'O';
                inp[row][drop + 1] = '.';
              } else {
                break;
              }
            }
          }
        }
      }
      break;
    case Dir.S:
      for (let row = inp.length - 1; row > 0; row--) {
        for (let col = 1; col < inp[row].length; col++) {
          if (inp[row][col] === 'O') {
            for (let drop = row + 1; drop < inp.length; drop++) {
              if (inp[drop][col] === '.') {
                inp[drop][col] = 'O';
                inp[drop - 1][col] = '.';
              } else {
                break;
              }
            }
          }
        }
      }
      break;
    case Dir.E:
      for (let col = inp[0].length - 1; col > 0; col--) {
        for (let row = 1; row < inp.length; row++) {
          if (inp[row][col] === 'O') {
            for (let drop = col + 1; drop < inp[0].length; drop++) {
              if (inp[row][drop] === '.') {
                inp[row][drop] = 'O';
                inp[row][drop - 1] = '.';
              } else {
                break;
              }
            }
          }
        }
      }
      break;
  }
}

function load(inp: string[][]): number {
  return inp.reduce(
    (t, row, i) =>
      t + row.filter((x) => x === 'O').length * (inp.length - i - 1),
    0,
  );
}

function enrobe(inp: string[][]): string[][] {
  // wrap rocks around the edge;
  inp = structuredClone(inp);
  // Ring around it
  inp.unshift(Array(inp[0].length).fill('#'));
  inp.push(Array(inp[0].length).fill('#'));
  return inp.map((x) => ['#', ...x, '#']);
}

function part1(inp: string[][]): number {
  inp = enrobe(inp);
  tilt(inp, Dir.N);
  return load(inp);
}

function part2(inp: string[][]): number {
  inp = enrobe(inp);

  const seen = new Map<string, number>();
  const cache = [];
  for (let i = 0; i < 1000000000; i++) {
    // Keep going until we see a loop, then project that loop forward in time.
    const key = inp.map((r) => r.join('')).join('\n');
    if (seen.has(key)) {
      return load(
        cache[
          (1000000000 - seen.get(key)!) % (i - seen.get(key)!) + seen.get(key)!
        ],
      );
    }
    cache.push(structuredClone(inp));
    seen.set(key, i);
    tilt(inp, Dir.N);
    tilt(inp, Dir.W);
    tilt(inp, Dir.S);
    tilt(inp, Dir.E);
  }
  return 0;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<string[][]>(args);
  return [part1(inp), part2(inp)];
}
