import { type MainArgs, parseFile } from './utils.ts';

interface Row {
  springs: string;
  groups: number[];
}
type Input = Row[];

function count(
  springs: string,
  groups: number[],
  cache: Record<string, number> = {},
): number {
  // Memoize
  const key = `${springs} ${groups}`;
  let ret = cache[key];
  if (ret !== undefined) {
    return ret;
  }

  if (springs === '') {
    // If there are groups left, we didn't find a match
    ret = (groups.length === 0) ? 1 : 0;
  } else if (groups.length === 0) {
    // Out of groups. If there aren't any # left, we found a match.
    ret = springs.includes('#') ? 0 : 1;
  } else {
    switch (springs[0]) {
      case '.':
        ret = count(springs.slice(1), groups, cache);
        break;
      case '?': {
        // Try both types, country and western.  Don't put a dot on that would
        // just have to be skipped.
        const rest = springs.slice(1);
        ret = count(rest, groups, cache) + count('#' + rest, groups, cache);
        break;
      }
      case '#':
        if (springs.length < groups[0]) {
          // Don't have enough left for the next group
          ret = 0;
        } else if (springs.slice(0, groups[0]).includes('.')) {
          // Next group too long for the current spring
          ret = 0;
        } else if (springs.length === groups[0]) {
          // If there's only one group left, and this spring is the right size,
          // that's a match.
          ret = (groups.length === 1) ? 1 : 0;
        } else if (springs[groups[0]] === '#') {
          // If this spring is too long, that's not a match.
          ret = 0;
        } else {
          // Try the next group.  Note that either the springs or the groups
          // we are passing in might be empty.
          ret = count(springs.slice(groups[0] + 1), groups.slice(1), cache);
        }
        break;
      default:
        throw new Error(`Invalid input: "${springs}"`);
    }
  }
  cache[key] = ret;
  return ret;
}

function part1(inp: Input): number {
  let tot = 0;
  for (const i of inp) {
    tot += count(i.springs, i.groups);
  }
  return tot;
}

function part2(inp: Input): number {
  let tot = 0;
  for (const i of inp) {
    const groups = Array(5).fill(i.groups).flat();
    const springs = Array(5).fill(i.springs).join('?');
    tot += count(springs, groups);
  }
  return tot;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input>(args);
  return [part1(inp), part2(inp)];
}
