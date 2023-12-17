import { type MainArgs, parseFile } from './lib/utils.ts';

interface Op {
  str: string;
  lens: string;
  op: '=' | '-';
  focal?: number;
}

type Input = Op[];

function hash(s: string): number {
  let val = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    val += c;
    val *= 17;
    val %= 256;
  }
  return val;
}

function part1(inp: Input): number {
  return inp.reduce((t, { str }) => t + hash(str), 0);
}

class Box {
  ordered: [string, number][] = [];

  add(s: string, len: number): void {
    const cur = this.ordered.findIndex(([name]) => name === s);
    if (cur === -1) {
      this.ordered.push([s, len]);
    } else {
      this.ordered[cur][1] = len;
    }
  }

  remove(s: string): void {
    const cur = this.ordered.findIndex(([name]) => name === s);
    if (cur !== -1) {
      this.ordered.splice(cur, 1);
    }
  }
}

function part2(inp: Input): number {
  const boxes = Array.from(Array(256), () => new Box());

  for (const { lens, op, focal } of inp) {
    const h = hash(lens);
    const box = boxes[h];
    switch (op) {
      case '-':
        box.remove(lens);
        break;
      case '=':
        box.add(lens, focal!);
        break;
      default:
        throw new Error(`Bad op: ${op}`);
    }
  }

  return boxes.reduce(
    (t, b, bn) =>
      t +
      b.ordered.reduce(
        (t, [_, focal], slot) => t + ((bn + 1) * (slot + 1) * focal),
        0,
      ),
    0,
  );
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input>(args);
  return [part1(inp), part2(inp)];
}
