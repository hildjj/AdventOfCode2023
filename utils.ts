import { dirname, fromFileUrl, join } from '$std/path/mod.ts';
import { TextLineStream } from '$std/streams/mod.ts';
import peggy from '$peggy';

export interface MainArgs {
  trace: boolean;
  day: string;
  _: (string | number)[];
  [x: string]: unknown;
}

export type MainEntry<T> = (args: MainArgs) => Promise<T>;

export const defaultArgs: MainArgs = {
  trace: false,
  day: '0',
  _: [],
};

/**
 * Utility functions.
 */
export class Utils {
  /**
   * Read file, parse lines.
   *
   * @param args - Args passed in to day.ts
   * @param filename - If null, figures out what day today is
   *   and finds the .txt file.
   * @returns One entry per line.
   */
  static async *readLines(
    args: MainArgs,
    filename?: string,
  ): AsyncGenerator<string> {
    if (!filename) {
      filename = this.adjacentFile(args, 'txt', 'inputs');
    }

    const f = await Deno.open(filename);
    const ts = f.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());

    for await (const s of ts) {
      if (s.length) {
        yield s;
      }
    }
  }

  /**
   * Read all non-blank lines from a file, returning an array.
   *
   * @param args - Args passed in to day.ts
   * @param filename - If null, figures out what day today is
   *   and finds the .txt file.
   * @returns One entry per line.
   */
  static async readAllLines(
    args: MainArgs,
    filename?: string,
  ): Promise<string[]> {
    const res: string[] = [];
    for await (const line of this.readLines(args, filename)) {
      res.push(line);
    }
    return res;
  }

  /**
   * Parse a file.
   *
   * @param args - CLI args
   * @param input - If null, figures out what day today is
   *   and finds the .txt file.
   * @param parser - If a string, the name of the parser
   *   file to require.  If a function, the pre-required parser.  If null,
   *   find the parser with the matching name. If no parser found, split
   *   like `readLines`.
   * @returns The output of the parser.
   */
  static async parseFile<T>(
    args: MainArgs,
    input?: string,
    parser?:
      | string
      | ((input: string, options?: peggy.ParserOptions) => unknown),
  ): Promise<T> {
    let text: string | undefined = undefined;
    let source: string | undefined = undefined;

    try {
      let parserFunc:
        | undefined
        | ((input: string, options?: peggy.ParserOptions) => unknown) =
          undefined;
      if (typeof parser === 'function') {
        parserFunc = parser;
      } else {
        source = parser ?? this.adjacentFile(args, 'peggy');
        text = await Deno.readTextFile(source);

        parserFunc = peggy.generate(text, {
          trace: args.trace,
          grammarSource: source,
        }).parse;
      }
      source = input ?? this.adjacentFile(args, 'txt', 'inputs');
      text = await Deno.readTextFile(source);

      return parserFunc(text, {
        grammarSource: source,
        sourceMap: 'inline',
        format: 'es',
      }) as T;
    } catch (er) {
      if (typeof (er as peggy.GrammarError).format === 'function') {
        er.message = (er as peggy.GrammarError).format([
          { source, text: text! },
        ]);
        er.stack = '';
      }
      throw er;
    }
  }

  /**
   * @returns The file with the given extension next to the calling file.
   */
  static adjacentFile(args: MainArgs, ext: string, ...dir: string[]): string {
    const p = dirname(fromFileUrl(import.meta.url));
    return join(p, ...dir, `day${args.day}.${ext}`);
  }

  static async exec(...args: string[]): Promise<void> {
    if (args.length < 1) {
      throw new TypeError('No args');
    }
    const bin = args.shift() as string;
    const cmd = new Deno.Command(bin, {
      args,
    });
    const status = await cmd.spawn().status;
    if (!status.success) {
      throw new Error(`${bin} failed`);
    }
  }

  /**
   * Modulo, minus the JS bug with negative numbers.
   * `-5 % 4` should be `3`, not `-1`.
   *
   * @param x - Divisor.
   * @param y - Dividend.
   * @returns Result of x mod y.
   * @throws {@link Error} Division by zero.
   */
  static mod<T extends number | bigint>(x: T, y: T): T {
    // == works with either 0 or 0n.
    // eslint-disable-next-line eqeqeq
    if (y === 0) {
      throw new Error('Division by zero');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: TS2365.  tsc can't see that x and y are always the same type
    return ((x % y) + y) % y;
  }

  /**
   * Integer result of x / y, plus the modulo (unsigned) remainder.
   *
   * @param x - Divisor.
   * @param y - Dividend.
   * @returns The quotient and remainder.
   */
  static divmod<T extends number | bigint>(x: T, y: T): [T, T] {
    let q = (x / y) as unknown as T;
    const r: T = this.mod(x, y);
    if (typeof x === 'bigint') {
      // Not only does Math.floor not work for BigInt, it's not needed because
      // `/` does the right thing in the first place.

      // except for numbers of opposite sign
      if ((q < 0n) && (r > 0n)) {
        // There was a remainder.  JS rounded toward zero, but python
        // rounds down.
        q--;
      }
      return [q, r];
    }
    if (typeof q === 'number') {
      return [Math.floor(q) as T, r];
    }

    /* c8 ignore next */
    throw new Error('Unreachable');
  }

  static gcd<T extends number | bigint>(...n: T[]): T {
    switch (n.length) {
      case 0:
        throw new Error('Invalid input');
      case 1:
        return n[0];
      case 2: {
        let [a, b] = n;
        // Needs to work for both 0 and 0n
        // deno-lint-ignore eqeqeq
        while (b != 0) {
          [a, b] = [b, Utils.mod(a, b)];
        }
        return a;
      }
      default:
        return n.reduce((t, v) => Utils.gcd(t, v));
    }
  }

  static lcm<T extends number | bigint>(...n: T[]): T {
    // TS isn't quite smart enough about generic maths,
    // so there are more `as T` here than I want.
    return n.reduce<T>(
      (t, v) => (((t * v) as T) / this.gcd(t, v)) as T,
      ((typeof n[0] === 'number') ? 1 : 1n) as T,
    );
  }
}
