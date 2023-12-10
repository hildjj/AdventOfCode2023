export class Rect<T> {
  #vals: T[][];

  constructor(wrapped: T[][]) {
    this.#vals = wrapped;
  }

  #check(x: number, y: number): void {
    if (
      (y < 0) || (y >= this.#vals.length) ||
      (x < 0) || (x >= this.#vals[y].length)
    ) {
      throw new RangeError(`${x},${y} not inside rect`);
    }
  }

  width(y = 0): number {
    return this.#vals[y].length;
  }

  get height(): number {
    return this.#vals.length;
  }

  get(x: number, y: number, dx = 0, dy = 0): T {
    const col = x + dx;
    const line = y + dy;
    this.#check(col, line);
    return this.#vals[line][col];
  }

  set(x: number, y: number, val: T): void {
    this.#check(x, y);
    this.#vals[y][x] = val;
  }

  forEach(
    callbackfn: (value: T, x: number, y: number, r: this) => void,
    thisAarg?: unknown,
  ): void {
    const that = thisAarg ?? this;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width(y); x++) {
        callbackfn.call(that, this.get(x, y), x, y, this);
      }
    }
  }

  map<U>(
    callbackfn: (value: T, x: number, y: number, r: this) => U,
    thisArg?: unknown,
  ): Rect<U> {
    const that = thisArg ?? this;
    const vals: U[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: U[] = [];
      for (let x = 0; x < this.width(y); x++) {
        row.push(callbackfn.call(that, this.get(x, y), x, y, this));
      }
      vals.push(row);
    }
    return new Rect(vals);
  }

  toString(): string {
    return this.#vals.map((line) => line.map((v) => String(v)).join('')).join(
      '\n',
    );
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }
}
