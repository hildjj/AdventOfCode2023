import { load } from '../fromdot.ts';

const dotDir = new URL(import.meta.resolve('./dots/'));
const d = Deno.readDir(dotDir);
const dec = new TextDecoder('utf-8', { fatal: true });
for await (const { name, isDirectory } of d) {
  if (isDirectory || !name.endsWith('.dot')) {
    continue;
  }

  console.log(name);
  const grammarSource = new URL(name, dotDir);
  const bin = await Deno.readFile(grammarSource);
  let text: string | undefined = undefined;

  try {
    text = dec.decode(bin);
    load(text, grammarSource);
  } catch (e) {
    if (e.format) {
      console.log(e.format([{ source: grammarSource, text }]));
    } else {
      console.log(e);
    }
  }
}
