# Advent of Code 2023

My solutions to [AdventOfCode 2023](https://adventofcode.com/2023)

## Pre-requisites

- [Deno](https://deno.com/) 1.38
- git
- An implementation of `open` that opens URLs in your browser. MacOSX has one.
- Visual Studio Code, with the command-line tool `code` installed.
- genhtml from the [lcov](https://github.com/linux-test-project/lcov) package
  (`brew install lcov`)

## Before the new day drops

Run `day.ts` with the `-n` argument. This will wait until today's puzzle
becomes available, then download today's input, open today's puzzle
description, and pull up boilerplate ready to be filled in with today's
solution.

```sh
$ ./day.ts -n
Waiting until 2023-12-01T05:00:00.300Z
```

## Running

Run today's solution with `day.ts`. If you would like to record the current
output as canonical, so that future testing will check that you still get the
same results, use `day.ts -r`. To run today's tests, `day.ts -t`.

## Tests

To run the tests for all days, `deno task test`, will run all of the tests,
and leave coverage information as HTML in `coverage/html/index.html` and
surrounding files.

## `day.ts` CLI

```txt
day.ts [options] [ARGS]

ARGS passed to day's main function as args._

Options:
  -d,--day <number> Day (default: latest day unless --new)
  -h,--help         Print help text and exit
  -r,--record       Record results as test data
  -t,--test         Check test results
  -T,--trace        Turn on grammar tracing
```

[![Test](https://github.com/hildjj/AdventOfCode2023/actions/workflows/deno.yml/badge.svg)](https://github.com/hildjj/AdventOfCode2023/actions/workflows/deno.yml)
