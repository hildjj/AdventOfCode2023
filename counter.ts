type countFilter = (n: number, s: string) => number | boolean;
const totalCount: countFilter = (n: number): number => n;

/**
 * Count all the things!
 */
export class Counter<T = string> {
  points: { [id: string]: number } = {};

  /**
   * Iterate over the entries in points.
   */
  *[Symbol.iterator](): Generator<[string, number], void, undefined> {
    yield* Object.entries(this.points);
  }

  get(...vals: T[]): number {
    const joined = String(vals);
    return this.points[joined] ?? 0;
  }

  /**
   * Add a thing.
   *
   * @param vals - The list of values that describe the thing.
   * @returns - The current total for this thing.
   */
  add(...vals: T[]): number {
    const joined = String(vals);
    const val = (this.points[joined] ?? 0) + 1;
    this.points[joined] = val;
    return val;
  }

  /**
   * Add something other than one.
   *
   * @param count - The amount to add.
   * @param vals - The list of values that describe the thing.
   * @returns number - The current total for this thing.
   */
  sum(count: number, ...vals: T[]): number {
    const joined = String(vals);
    const val = (this.points[joined] ?? 0) + count;
    this.points[joined] = val;
    return val;
  }

  /**
   * Count the total number of things, possibly filtered.
   *
   * @param fn - A filter function.  If it returns boolean, count 1 if true.
   *   If number, counts that many.
   * @returns The count of all of the things that match the filter.
   */
  total(fn: countFilter = totalCount): number {
    return Object
      .entries(this.points)
      .reduce((t, [s, v]): number => {
        const res = fn(v, s);
        if (typeof res === 'boolean') {
          return t + (res ? 1 : 0);
        }
        return t + res;
      }, 0);
  }

  /**
   * The maximum entry.
   *
   * @returns the [key, value] of the maximum value, or null if empty.
   */
  max(): [string, number] | null {
    let mv = -Infinity;
    let mk: string | null = null;
    for (const [k, v] of this) {
      if (v > mv) {
        mv = v;
        mk = k;
      }
    }
    return (mk === null) ? mk : [mk, mv];
  }

  /**
   * How many unique things have been added?
   *
   * @returns The count.
   */
  size(): number {
    return Object.keys(this.points).length;
  }
}
