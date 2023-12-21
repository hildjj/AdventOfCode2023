import { assert } from '$std/assert/assert.ts';
import { type MainArgs, parseFile } from './lib/utils.ts';
import { lcm } from './lib/utils.ts';

type Op = '%' | '&' | 'broadcaster' | '';
interface Input {
  lhs: [op: Op, name: string];
  rhs: string[];
}

interface Event {
  from: string;
  to: string;
  pulse: boolean;
}

class Queue {
  count = 0;
  high = 0;
  low = 0;
  events: Event[] = [];
  modules: Record<string, Module> = {};

  factory(op: Op, name: string): Module {
    switch (op) {
      case 'broadcaster':
        return this.modules[name] = new Broadcaster(name);
      case '%':
        return this.modules[name] = new FlipFlop(name);
      case '&':
        return this.modules[name] = new Conjunction(name);
      case '':
        return this.modules[name] = new Terminal(name);
    }
  }

  load(inp: Input[]): void {
    for (const { lhs, rhs } of inp) {
      const [op, name] = lhs;
      const mod = this.factory(op, name);
      mod.outputs = rhs;
    }
    for (const { lhs, rhs } of inp) {
      const [_op, name] = lhs;
      for (const output of rhs) {
        let mod = this.modules[output];
        if (!mod) {
          mod = this.factory('', output);
        } else if (mod instanceof Conjunction) {
          mod.state[name] = false;
        }
        mod.inputs.push(name);
      }
    }
  }

  start(to = 'broadcaster'): void {
    this.push({
      from: 'button',
      to,
      pulse: false,
    });
  }

  push(event: Event): void {
    this.events.push(event);
  }

  tick(): boolean {
    const event = this.events.shift();
    if (!event) {
      return false;
    }

    const mod = this.modules[event.to];
    assert(mod);

    this.count++;
    if (event.pulse) {
      this.high++;
    } else {
      this.low++;
    }

    mod.receive(event, this);
    return true;
  }

  controllers(): string[] {
    const terminal = Object.values(this.modules).find((m) =>
      m instanceof Terminal
    );
    return terminal ? [...this.modules[terminal.inputs[0]].inputs] : [];
  }

  toDot(): void {
    const cont = this.controllers();
    cont.push(...this.modules['rx'].inputs, 'rx');
    let dot = `\
strict digraph {
  button [shape=cylinder];
  button -> broadcaster;
`;
    dot += '  subgraph cluster_terminal {\n';
    dot += '    label = Terminal;\n';
    dot += '    color = red;\n';
    dot += `    node [color=red];\n`;

    for (const c of cont) {
      dot += `    ${c} [shape=${this.modules[c].shape}];\n`;
    }
    dot += '  };\n';
    for (const mod of Object.values(this.modules)) {
      if (!cont.includes(mod.name)) {
        dot += `  ${mod.name} [shape=${mod.shape}];\n`;
      }
      dot += `  ${mod.name} -> {${mod.outputs.join(', ')}};\n`;
    }

    dot += `  {rank=same; ${this.modules['broadcaster'].outputs.join('; ')}}\n`;
    cont.splice(-2, 2);
    dot += `  {rank=same; ${
      cont.map((c) => this.modules[c].inputs.join('; ')).join('; ')
    };}\n`;
    dot += '}\n';
    Deno.writeTextFileSync('day20.dot', dot);
  }
}

// true => High.  false => Low.
// off = false, on = true
abstract class Module {
  name: string;
  outputs: string[] = [];
  inputs: string[] = [];
  shape = '';
  static op: Op;

  constructor(name: string) {
    this.name = name;
  }

  abstract receive(event: Event, q: Queue): void;

  send(pulse: boolean, q: Queue): void {
    for (const o of this.outputs) {
      q.push({
        from: this.name,
        to: o,
        pulse,
      });
    }
  }
}

class Broadcaster extends Module {
  static op: Op = 'broadcaster';
  shape = 'cylinder';

  receive(event: Event, q: Queue): void {
    this.send(event.pulse, q);
  }
}

class FlipFlop extends Module {
  static op: Op = '%';
  shape = 'box';
  state = false;

  receive(event: Event, q: Queue): void {
    if (!event.pulse) {
      this.state = !this.state;
      this.send(this.state, q);
    }
  }
}

class Conjunction extends Module {
  static op: Op = '&';
  shape = 'diamond';
  state: Record<string, boolean> = {};

  receive(event: Event, q: Queue): void {
    this.state[event.from] = event.pulse;
    if (Object.values(this.state).every((x) => x)) {
      this.send(false, q);
    } else {
      this.send(true, q);
    }
  }
}

class Terminal extends Module {
  static op: Op = '';
  shape = 'doublecircle';
  state = false;
  firstLow = 0;

  receive(event: Event): void {
    if (!event.pulse) {
      this.state = true;
    }
  }
}

function part1(inp: Input[]): number {
  const q = new Queue();
  q.load(inp);

  for (let i = 0; i < 1000; i++) {
    q.start();
    while (q.tick()) {
      // No-op
    }
  }

  return q.high * q.low;
}

function part2(inp: Input[]): number {
  const q = new Queue();
  q.load(inp);

  q.toDot();

  // rx always has one input, a conjunction with 4 inputs.
  const inputs = q.controllers().map((input) =>
    q.factory('', input) as Terminal
  );

  for (let i = 0;; i++) {
    // Go until all of the inputs have gotten a low signal at least once,
    // remembering the first time it happened.
    if (
      inputs.reduce((t, output) => {
        if (output.state) {
          output.firstLow ||= i;
          return t;
        }
        return false;
      }, true)
    ) {
      break;
    }
    q.start();
    while (q.tick()) {
      // No-op
    }
  }
  return lcm(...inputs.map((o) => o.firstLow));
}

export default async function main(args: MainArgs): Promise<[number, number]> {
  const inp = await parseFile<Input[]>(args);
  return [part1(inp), part2(inp)];
}
