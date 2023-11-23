import { defaultArgs, Utils } from '../utils.ts';
import { assertEquals, assertRejects, assertThrows } from '$std/assert/mod.ts';
import { fromFileUrl } from '$std/path/from_file_url.ts';

const INVALID_FILE = `_____DOES___NOT___EXIST:${Deno.pid}`;

Deno.test('Utils', async (t) => {
  await t.step('divmod', () => {
    assertEquals(Utils.divmod<number>(4, 4), [1, 0]);
    assertEquals(Utils.divmod<number>(-5, 4), [-2, 3]);

    assertEquals(Utils.divmod<bigint>(4n, 4n), [1n, 0n]);
    assertEquals(Utils.divmod<bigint>(-5n, 4n), [-2n, 3n]);
    assertEquals(Utils.divmod<bigint>(-5n, -4n), [1n, -1n]);

    assertThrows(() => Utils.divmod(4, 0), Error, 'Division by zero');
    assertThrows(() => Utils.divmod(4n, 0n), Error, 'Division by zero');
  });

  await t.step('mod', () => {
    assertEquals(Utils.mod<number>(4, 4), 0);
    assertEquals(Utils.mod<number>(-5, 4), 3);
    assertEquals(Utils.mod<bigint>(4n, 4n), 0n);
    assertEquals(Utils.mod<bigint>(-5n, 4n), 3n);
    assertEquals(Utils.mod<bigint>(-5n, -4n), -1n);
    assertThrows(() => Utils.mod(4, 0), Error, 'Division by zero');
    assertThrows(() => Utils.mod(4n, 0n), Error, 'Division by zero');
  });

  await t.step('gcd', () => {
    assertThrows(() => Utils.gcd());
    assertEquals(Utils.gcd(8), 8);
    assertEquals(Utils.gcd(8n), 8n);
    assertEquals(Utils.gcd(8, 12), 4);
    assertEquals(Utils.gcd(8n, 12n), 4n);
    assertEquals(Utils.gcd(8, 12, 16), 4);
    assertEquals(Utils.gcd(8n, 12n, 16n), 4n);
  });

  await t.step('lcm', () => {
    assertEquals(Utils.lcm(8, 12), 24);
    assertEquals(Utils.lcm(8n, 12n), 24n);
  });

  await t.step('readLines', async () => {
    let count = 0;
    for await (const _line of Utils.readLines(defaultArgs)) {
      count++;
    }
    assertEquals(count, 2000);
  });

  await t.step('readAllLines', async () => {
    const a = await Utils.readAllLines(defaultArgs);
    assertEquals(a.length, 2000);
  });

  await t.step('exec', async () => {
    await assertRejects(() => Utils.exec(), TypeError);
    await assertRejects(() => Utils.exec(INVALID_FILE));
    await assertRejects(() => Utils.exec('/usr/bin/false'));
    await Utils.exec('/usr/bin/true', 'foo', 'bar');
  });

  await t.step('parseFile', async () => {
    const r = await Utils.parseFile<number[]>(defaultArgs);
    assertEquals(r.length, 2000);

    const parse = () => ['3', '4'];
    const fn = fromFileUrl(
      new URL('../inputs/day0.txt', import.meta.url),
    );
    const u = await Utils.parseFile<string[]>(defaultArgs, fn, parse);
    assertEquals(u, ['3', '4']);

    await assertRejects(() => Utils.parseFile(defaultArgs, INVALID_FILE));
    await assertRejects(() =>
      Utils.parseFile(
        defaultArgs,
        undefined,
        Utils.adjacentFile({ ...defaultArgs, day: 'Invalid' }, 'peggy', 'test'),
      )
    );
  });
});
