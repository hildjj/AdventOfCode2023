import { type MainArgs, Utils } from './utils.ts';

function part1(inp: number[]): number {
  return inp.length;
}

function part2(inp: number[]): bigint {
  return inp.reduce((t, v) => t + BigInt(v), 0n);
}

export default async function main(args: MainArgs): Promise<[number, bigint]> {
  const inp = await Utils.parseFile<number[]>(args);
  return [part1(inp), part2(inp)];
}
