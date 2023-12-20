import { type MainArgs, parseFile } from './lib/utils.ts';
import type { Input, Workflow } from './day19.ts';
import { Graph, type Link, type Node } from './graph/graph.ts';

function* dfs<NodeData, LinkData, NodeId extends string | number>(
  graph: Graph<NodeData, LinkData, NodeId>,
  startFromNodeId: NodeId,
): Generator<
  [
    Node<NodeData, LinkData, NodeId> | undefined,
    Link<LinkData | undefined, NodeId> | undefined,
    Node<NodeData, LinkData, NodeId>,
  ],
  undefined,
  undefined
> {
  const queue: Node<NodeData, LinkData, NodeId>[] = [];
  const seen = new WeakSet<Node<NodeData, LinkData, NodeId>>();

  let prev = graph.getNode(startFromNodeId);
  if (prev) {
    seen.add(prev);
    queue.push(prev);
    yield [undefined, undefined, prev];
  } else {
    return;
  }
  while ((prev = queue.pop())) {
    for (const [node, link, otherNode] of graph.linkedNodes(prev, true)) {
      yield [node, link, otherNode];
      if (!seen.has(otherNode)) {
        seen.add(otherNode);
        queue.push(otherNode);
      }
    }
  }
}

export default async function main(args: MainArgs): Promise<void> {
  const inp = await parseFile<Input>(args, undefined, 'day19.peggy');

  let out = '';
  const g = new Graph<undefined, Workflow, string>();
  for (const [name, workflows] of Object.entries(inp.workflows)) {
    for (const wf of workflows) {
      g.addLink(name, wf.dest, wf);
    }
  }
  out += `strict digraph "${args._[0]}" {\n`;
  for (const [from, link, to] of dfs(g, 'in')) {
    if (from) {
      const label = link?.data?.op
        ? `${link.data.xmas}${link.data.op}${link.data.num}`
        : '';
      out += `  "${from.id}" -> "${to.id}" [label="${label}"];`;
    }
  }
  out += '}';
  Deno.writeTextFile('p.dot', out);
}
