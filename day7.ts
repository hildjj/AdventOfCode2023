import { type MainArgs, parseFile } from './lib/utils.ts';
import { Counter } from './lib/counter.ts';

enum HandType {
  HIGH,
  PAIR1,
  PAIR2,
  KIND3,
  FULL,
  KIND4,
  KIND5,
}

interface Hand {
  cards: string[];
  bid: number;
  type?: HandType;
}

const CARDS: Record<string, number> = {
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};
for (let i = 2; i <= 9; i++) {
  CARDS[i] = i - 1;
}

function getHandType(counts: number[]): HandType {
  switch (counts[0]) {
    case 5:
      return HandType.KIND5;
    case 4:
      return HandType.KIND4;
    case 3:
      if (counts[1] === 2) {
        return HandType.FULL;
      }
      return HandType.KIND3;
    case 2:
      if (counts[1] === 2) {
        return HandType.PAIR2;
      }
      return HandType.PAIR1;
    default:
      return HandType.HIGH;
  }
}

function cmpHands(
  cardValues: Record<string, number>,
): (a: Required<Hand>, b: Required<Hand>) => number {
  return (a, b) => {
    if (a.type !== b.type) {
      return a.type - b.type;
    }
    for (let i = 0; i < a.cards.length; i++) {
      if (a.cards[i] !== b.cards[i]) {
        return cardValues[a.cards[i]] - cardValues[b.cards[i]];
      }
    }
    return 0;
  };
}

function part1(inp: Hand[]): number {
  const cmp = cmpHands(CARDS);
  const mapped = inp.map(({ cards, bid }) => {
    const counts = new Counter<string>().addAll(cards);
    const type = getHandType(counts.values().sort((a, b) => b - a));
    return { cards, bid, type };
  }).sort(cmp);

  return mapped.reduce((t, v, i) => t + (v.bid * (i + 1)), 0);
}

function part2(inp: Hand[]): number {
  const JCARDS = { ...CARDS };
  JCARDS['J'] = -1; // J is now the lowest
  const cmp = cmpHands(JCARDS);
  const mapped = inp.map(({ cards, bid }) => {
    const counts = new Counter<string>().addAll(cards);
    const { J = 0 } = counts.points;
    delete counts.points.J;

    const e = counts.values().sort((a, b) => b - a);
    e[0] = (e[0] ?? 0) + J;
    const type = getHandType(e);
    return { cards, bid, type };
  }).sort(cmp);
  return mapped.reduce((t, v, i) => t + (v.bid * (i + 1)), 0);
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Hand[]>(args);
  return [part1(inp), part2(inp)];
}
