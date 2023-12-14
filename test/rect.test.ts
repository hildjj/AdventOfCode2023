import { Rect } from '../rect.ts';

import { assert, assertEquals, assertThrows } from '$std/assert/mod.ts';

Deno.test('Rect', async (t) => {
  const r = new Rect([
    'abc'.split(''),
    'def'.split(''),
  ]);

  await t.step('ofSize', () => {
    const s = Rect.ofSize(10, 5, 6);
    assertEquals(s.width, 10);
    assertEquals(s.height, 5);
    assertEquals(s.get(9, 4), 6);

    const t = Rect.ofSize(10, 5, (x, y) => x * y);
    assertEquals(t.get(9, 4), 36);
  });

  await t.step('#check', () => {
    assertThrows(() => r.get(0, 2));
  });

  await t.step('reduce', () => {
    assertEquals(r.reduce((t, v) => t + v), 'abcdef');
    assertEquals(r.reduce((t, v) => t + v, 'h'), 'habcdef');
    assertEquals(r.reduce((t, v) => t + v.length, 0), 6);
  });

  await t.step('vals', () => {
    assertEquals(r.rows(), [['a', 'b', 'c'], ['d', 'e', 'f']]);
    assertEquals(r.columns(), [['a', 'd'], ['b', 'e'], ['c', 'f']]);
  });

  await t.step('transpose', () => {
    assertEquals(r.transpose(), new Rect([['a', 'd'], ['b', 'e'], ['c', 'f']]));
  });

  await t.step('rotate', () => {
    let s = r.rotateClockwise();
    assertEquals(s, new Rect([['d', 'a'], ['e', 'b'], ['f', 'c']]));
    s = r.rotateCounterClockwise();
    assertEquals(s, new Rect([['c', 'f'], ['b', 'e'], ['a', 'd']]));
  });

  await t.step('with', () => {
    const s = r.with(0, 0, 'z');
    assertEquals(r.get(0, 0), 'a');
    assertEquals(s.get(0, 0), 'z');
    assert(!r.equals(s));
    assert(!r.equals(null!));
    assert(!r.equals(Rect.ofSize(3, 5, '')));
    assert(!r.equals(Rect.ofSize(5, 3, '')));
  });

  await t.step('toString', () => {
    assertEquals(r.toString(), 'abc\ndef');
  });

  await t.step('inspect', () => {
    assertEquals(Deno.inspect(r), 'abc\ndef');
  });

  await t.step('forEach', () => {
    let count = 0;
    r.forEach((s, x, y) => {
      assertEquals(s, r.get(x, y));
      count++;
    });
    assertEquals(count, 6);
  });
});
