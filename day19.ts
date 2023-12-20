import { type MainArgs, parseFile } from './lib/utils.ts';

export enum Xmas {
  x = 'x',
  m = 'm',
  a = 'a',
  s = 's',
}

export type xmas = keyof typeof Xmas;
export const XMAS = Object.keys(Xmas) as xmas[];

export interface DestWorkflow {
  op: undefined;
  dest: string;
}
export interface OpWorkflow {
  op: '<' | '>';
  dest: string;
  xmas: xmas;
  num: number;
}

export type Workflow = OpWorkflow | DestWorkflow;

export interface Input {
  workflows: Record<string, Workflow[]>;
  parts: Record<xmas, number>[];
}

function part1(inp: Input): number {
  let tot = 0;
  for (const part of inp.parts) {
    let wf = 'in';
    while (wf !== 'A' && wf !== 'R') {
      const rule = inp.workflows[wf];
      RULES:
      for (const w of rule) {
        switch (w.op) {
          case '<':
            if (part[w.xmas] < w.num) {
              wf = w.dest;
              break RULES;
            }
            break;
          case '>':
            if (part[w.xmas] > w.num) {
              wf = w.dest;
              break RULES;
            }
            break;
          default:
            wf = w.dest;
        }
      }
    }
    if (wf === 'A') {
      tot += Object.values(part).reduce((t, v) => t + v, 0);
    }
  }
  return tot;
}

function part2(inp: Input): number {
  type Range = { min: number; max: number };
  type State = { [key in Xmas]: Range } & { wf: string };
  const pending: State[] = [
    {
      wf: 'in',
      x: { min: 1, max: 4000 },
      m: { min: 1, max: 4000 },
      a: { min: 1, max: 4000 },
      s: { min: 1, max: 4000 },
    },
  ];

  let tot = 0;
  let state: State | undefined;
  while ((state = pending.shift())) {
    if (state.wf === 'A') {
      tot += XMAS.reduce(
        (t, k: xmas) => t * (state![k].max - state![k].min + 1),
        1,
      );
      continue;
    }
    if (state.wf === 'R') {
      continue;
    }
    for (const workflow of inp.workflows[state.wf]) {
      switch (workflow.op) {
        case '<': {
          const d = structuredClone(state);
          d.wf = workflow.dest;
          d[workflow.xmas].max = workflow.num - 1;
          state[workflow.xmas].min = workflow.num; // Whittle down state
          pending.push(d);
          break;
        }
        case '>': {
          const d = structuredClone(state);
          d.wf = workflow.dest;
          d[workflow.xmas].min = workflow.num + 1;
          state[workflow.xmas].max = workflow.num;
          pending.push(d);
          break;
        }
        default:
          state.wf = workflow.dest;
          pending.push(state);
      }
    }
  }

  return tot;
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input>(args);
  return [part1(inp), part2(inp)];
}
