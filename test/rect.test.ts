import { Rect } from '../rect.ts';

import { assertEquals, assertThrows } from '$std/assert/mod.ts';

Deno.test('Rect', async (t) => {
  const r = new Rect([
    'abc'.split(''),
  ]);

  await t.step('#check', () => {
    assertThrows(() => r.get(0, 1));
  });

  await t.step('toString', () => {
    assertEquals(r.toString(), 'abc');
  });

  await t.step('inspect', () => {
    assertEquals(Deno.inspect(r), 'abc');
  });

  await t.step('forEach', () => {
    let count = 0;
    r.forEach((s, x, y) => {
      assertEquals(s, r.get(x, y));
      count++;
    });
    assertEquals(count, 3);
  });
});
