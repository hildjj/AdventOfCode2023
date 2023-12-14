export type RectMapCallback<T, U> = (
  value: T,
  x: number,
  y: number,
  r: Rect<T>,
) => U;

export type RectTransformCallback<T, U> = (
  prev: U,
  value: T,
  x: number,
  y: number,
  r: Rect<T>,
) => U;

export type RectInitCallback<T> = (
  x: number,
  y: number,
) => T;

export type RectEachCallback<T> = (
  value: T,
  x: number,
  y: number,
  r: Rect<T>,
) => void;

export class Rect<T = string> {
  #vals: T[][];

  constructor(wrapped: T[][]) {
    this.#vals = wrapped;
  }

  /**
   * Create a newly-initialized rect with the given size.
   *
   * @param width
   * @param height
   * @param val constant, or function that returns a per-cell value
   * @returns Rect of size width, height, initialized by val
   */
  static ofSize<U>(
    width: number,
    height: number,
    val: U | RectInitCallback<U>,
  ): Rect<U> {
    const f = (typeof val) === 'function';
    const v = Array.from<unknown, U[]>(Array(height), (_, j) => {
      return Array.from<unknown, U>(Array(width), (_, i) => {
        if (f) {
          return (val as RectInitCallback<U>).call(this, i, j);
        }
        return val;
      });
    });
    return new Rect(v);
  }

  /**
   * Are x and y inside the rect?
   * @param x
   * @param y
   * @throws if either invalid
   */
  #check(x: number, y: number): void {
    if (
      (y < 0) || (y >= this.#vals.length) ||
      (x < 0) || (x >= this.#vals[y].length)
    ) {
      throw new RangeError(`${x},${y} not inside rect`);
    }
  }

  /**
   * Assume that the rectangle is uniform, so the length of the first row
   * is the width.
   *
   * @readonly
   * @type {number}
   */
  get width(): number {
    return this.#vals[0].length;
  }

  /**
   * Number of rows.
   *
   * @readonly
   * @type {number}
   */
  get height(): number {
    return this.#vals.length;
  }

  /**
   * Get a value at a given [x,y] position.  Getting from an offset is somewhat
   * common, so it is included.
   *
   * @param x
   * @param y
   * @param dx Difference from x
   * @param dy Difference from y
   * @returns
   */
  get(x: number, y: number, dx = 0, dy = 0): T {
    const col = x + dx;
    const line = y + dy;
    this.#check(col, line);
    return this.#vals[line][col];
  }

  /**
   * Set the value at [x,y].
   *
   * @param x
   * @param y
   * @param val
   */
  set(x: number, y: number, val: T): void {
    this.#check(x, y);
    this.#vals[y][x] = val;
  }

  /**
   * Iterate over the rect.
   *
   * @param callbackfn
   */
  forEach(callbackfn: RectEachCallback<T>): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.#vals[y].length; x++) {
        callbackfn.call(this, this.get(x, y), x, y, this);
      }
    }
  }

  /**
   * Map from the rect to a new rect, with a new type.
   *
   * @param callbackfn
   * @returns
   */
  map<U>(
    callbackfn: RectMapCallback<T, U>,
  ): Rect<U> {
    const vals: U[][] = [];
    const h = this.height;
    const w = this.width;
    for (let y = 0; y < h; y++) {
      const row: U[] = [];
      for (let x = 0; x < w; x++) {
        row.push(callbackfn.call(this, this.get(x, y), x, y, this));
      }
      vals.push(row);
    }
    return new Rect(vals);
  }

  /**
   * Run a reducer over the contents of the rect.  If initial value not
   * specified, calls callbackFn for the first time with
   * (r[0,0], r[1,0], 1, 0, r).
   *
   * @param callbackFn
   * @param initial
   * @returns
   */
  reduce<U = T>(
    callbackFn: RectTransformCallback<T, U>,
    initial?: U,
  ): U {
    let first = initial === undefined;
    let prev = (first ? this.#vals[0][0] : initial) as U;
    this.forEach((val, x, y) => {
      if (first) {
        first = false;
      } else {
        prev = callbackFn.call(this, prev, val, x, y, this);
      }
    });
    return prev;
  }

  /**
   * @returns The values in the rect.
   */
  rows(): T[][] {
    return this.#vals;
  }

  /**
   * @returns An array of column arrays.
   */
  columns(): T[][] {
    return this.#vals[0].map((_, i) => this.#vals.map((v) => v[i]));
  }

  /**
   * @returns New rect with swapped axes.
   */
  transpose(): Rect<T> {
    return new Rect(this.columns());
  }

  /**
   * @returns Deep copy
   */
  copy(): Rect<T> {
    return new Rect(structuredClone(this.#vals));
  }

  /**
   * @param x
   * @param y
   * @param val new value
   * @returns Copy of rect, with [x,y] set to val
   */
  with(x: number, y: number, val: T): Rect<T> {
    const r = this.copy();
    r.set(x, y, val);
    return r;
  }

  /**
   * @returns Copy of rect, rotated right
   */
  rotateClockwise(): Rect<T> {
    // Transpose and reverse columns
    return new Rect(
      this.#vals[0].map((_, col) =>
        this.#vals.map((row) => row[col]).reverse()
      ),
    );
  }

  /**
   * @returns Copy of rect, rotated left
   */
  rotateCounterClockwise(): Rect<T> {
    return new Rect(
      this.#vals[0].map((_, col) =>
        this.#vals.map((row) => row[row.length - col - 1])
      ),
    );
  }

  /**
   * Wrap rectangle with a new value, so all outside edges are the same.
   *
   * @param val
   * @returns Wrapped rect, height + 2, width + 2
   */
  wrap(val: T): Rect<T> {
    const vals = structuredClone(this.#vals);
    vals.unshift(Array(this.width).fill(val));
    vals.push(Array(this.width).fill('#'));
    return new Rect(vals.map((x: T[]) => [val, ...x, val]));
  }

  /**
   * @param other
   * @returns True if all vals equal
   */
  equals(other: Rect<T>): boolean {
    if (this === other) {
      return true;
    }
    if (
      !other ||
      other.height !== this.height ||
      other.width !== this.width
    ) {
      return false;
    }

    return this.reduce((t, val, x, y) => t && (val === other.get(x, y)), true);
  }

  /**
   * @param separator For non-trival rects, use ' ' or ',' (.e.g)
   * @returns multi-line string, no trailing newline
   */
  toString(separator = ''): string {
    return this.#vals
      .map((line) => line.map((v) => String(v)).join(separator))
      .join('\n');
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }
}
