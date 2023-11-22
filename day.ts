#!/usr/bin/env -S deno run -A --unstable

import { assertEquals } from '$std/assert/mod.ts';
import { fromFileUrl, parse as pathParse } from '$std/path/mod.ts';
import { getCookieJar } from '$curlcookie';
import { parse as parseFlags } from '$std/flags/mod.ts';
import { type MainEntry, Utils } from './utils.ts';
import { Cookie, CookieJar, CookieOptions, wrapFetch } from '$jar';

const YEAR = 2023;

const args = parseFlags(Deno.args, {
  boolean: ['help', 'new', 'record', 'test', 'trace', 'nowait'],
  string: ['day'],
  alias: {
    d: 'day',
    h: 'help',
    n: 'new',
    r: 'record',
    t: 'test',
    T: 'trace',
  },
  default: {
    trace: false,
    day: '',
  },
});

if (args.help) {
  console.log(`\
day.ts [options] [ARGS]

ARGS passed to day's main function as args._

Options:
  -d,--day [number] Day (default: latest day unless --new)
  -h,--help         Print help text and exit
  -r,--record       Record results as test data
  -t,--test         Check test results
  -T,--trace        Turn on grammar tracing`);
  Deno.exit(64);
}

const template: string[] = [];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (ms <= 0) {
      resolve();
    } else {
      setTimeout(resolve, ms);
    }
  });
}

async function last(): Promise<string> {
  const p = pathParse(fromFileUrl(import.meta.url));
  let max = -Infinity;
  for await (const f of Deno.readDir(p.dir)) {
    let m = f.name.match(/^day(\d+)\.ts$/);
    if (m) {
      max = Math.max(max, parseInt(m[1], 10));
    }
    m = f.name.match(/^day0\./);
    if (m) {
      template.push(f.name);
    }
  }
  return max.toString();
}

if (!args.day) {
  args.day = await last();
}

if (args.new) {
  if (template.length === 0) {
    await last();
  } else {
    args.day = String(parseInt(args.day, 10) + 1);
  }

  const jsonJar = await getCookieJar('.cookies');
  const cookieJar = new CookieJar(
    Object.values(jsonJar).map((c) => new Cookie(c as CookieOptions)),
  );
  const fetch = wrapFetch({ cookieJar });

  await Utils.exec('open', `https://adventofcode.com/${YEAR}/day/${args.day}`);

  if (!args.nowait) {
    const d = new Date(
      Date.UTC(2023, 11, parseInt(args.day, 10), 5, 0, 0, 300),
    );
    console.log(`Waiting until ${d.toISOString()}`);
    await wait(d.getTime() - Date.now());
  }

  const res = await fetch(
    `https://adventofcode.com/${YEAR}/day/${args.day}/input`,
  );
  const input = await res.text();

  await Utils.exec('git', 'co', '-b', `day${args.day}`);
  const inputFile = Utils.adjacentFile(args, 'txt', 'inputs');
  await Deno.writeTextFile(inputFile, input);
  await Utils.exec('code', inputFile);

  const copies = template.map((f) => [
    new URL(f, import.meta.url),
    new URL(f.replace('0', args.day), import.meta.url),
  ]);

  // Copy to new day
  await Promise.all(copies.map(([from, to]) => Deno.copyFile(from, to)));

  for (const [_from, to] of copies) {
    await Utils.exec('code', fromFileUrl(to));
  }
  Deno.exit(0);
}

const mod = (await import(
  new URL(`day${args.day}.ts`, import.meta.url).toString()
)).default as MainEntry<unknown>;

try {
  const results = await mod(args);
  if (args.record) {
    const str = Deno.inspect(results, {
      colors: false,
      compact: true,
      depth: Infinity,
      iterableLimit: Infinity,
      strAbbreviateSize: Infinity,
      trailingComma: true,
    }).replaceAll('[ ', '[').replaceAll(' ]', ']');

    await Deno.writeTextFile(
      Utils.adjacentFile(args, 'js', 'test'),
      `export default ${str};\n`,
    );
  }

  if (args.test) {
    const expected = await import(Utils.adjacentFile(args, 'js', 'test'));
    assertEquals(results, expected.default);
  }

  console.log(Deno.inspect(results, {
    colors: Deno.isatty(Deno.stdout.rid),
    depth: Infinity,
    iterableLimit: Infinity,
    strAbbreviateSize: Infinity,
    trailingComma: true,
  }));
} catch (er) {
  if (!er.format) {
    console.error(er);
  }
}
