import { parse as parseDot } from './dot.js';
import { Graph, type Node } from './graph.ts';

export type CompassPt = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export type Stmt = AttrStmt | EdgeStmt | NodeStmt | Subgraph;

export interface Port {
  type: 'port';
  id: string | number;
  compassPt?: CompassPt;
}

export interface NodeId {
  type: 'node_id';
  id: string | number;
  port?: Port;
}

export interface HTMLString {
  type: 'id';
  value: string;
  html: true;
}

export interface Attr {
  type: 'attr';
  id: string | number;
  eq: string | HTMLString;
}

export interface Subgraph {
  type: 'subgraph';
  children: Stmt[];
  id?: string | number;
}

export interface AttrStmt {
  type: 'attr_stmt';
  target: 'graph' | 'node' | 'edge';
  attrList: Attr[];
}

export interface EdgeStmt {
  type: 'edge_stmt';
  edgeList: (Subgraph | NodeId)[];
  attrList: Attr[];
}

export interface NodeStmt {
  type: 'node_stmt';
  id: NodeId;
  attrList: Attr[];
}

export interface DotGraph {
  type: 'graph' | 'digraph';
  children: Stmt[];
  strict?: boolean;
  id?: string | number;
}

type MyNodeData = Record<string, string>;
type MyLinkData = Record<string, string>;
type MyNodeId = string | number;
type MyGraph = Graph<MyNodeData, MyLinkData, MyNodeId>;
type MyNode = Node<MyNodeData, MyLinkData, MyNodeId>;

/**
 * Loads graph from 'dot' string.
 *
 * @param dotGraph a graph in `dot` format
 * @param appendTo optional argument if you want to append parsed
 *   graph to an old graph.
 *
 * @return Parsed graph
 *
 * @see https://en.wikipedia.org/wiki/DOT_(graph_description_language)
 */
export function load(
  dotGraph: string,
  grammarSource: string | URL = 'unknown file',
  appendTo: MyGraph | undefined = undefined,
): MyGraph {
  let dotAST: DotGraph[] | undefined;
  try {
    dotAST = parseDot(dotGraph, { grammarSource }) as DotGraph[];
  } catch (e) {
    if (e.format) {
      throw new Error(e.format([{ source: grammarSource, text: dotGraph }]));
    }
    throw e;
  }
  if (dotAST.length > 1 && appendTo !== undefined) {
    throw new Error(
      'Dot file contains multiple graphs. Cannot use `saveTo` in this case',
    );
  }

  appendTo ??= new Graph();
  for (const g of dotAST) {
    loadOne(appendTo, g);
  }
  return appendTo;
}

function loadOne(graph: MyGraph, ast: DotGraph): MyGraph {
  loadSubgraph(graph, ast);

  return graph;
}

function loadSubgraph(graph: MyGraph, ast: DotGraph | Subgraph): MyNodeId[] {
  const addedNodes: MyNodeId[] = [];

  for (const child of ast.children) {
    if (child.type === 'edge_stmt') {
      concat(addedNodes, processEdgeStatement(graph, child));
    } else if (child.type === 'node_stmt') {
      concat(addedNodes, processNodeStatement(graph, child));
    } else if (child.type === 'subgraph') {
      concat(addedNodes, loadSubgraph(graph, child));
    }
  }

  return addedNodes;
}

function processEdgeStatement(
  graph: MyGraph,
  edgeAST: EdgeStmt,
): MyNodeId[] {
  const edges = edgeAST.edgeList;
  const addedNodes: MyNodeId[] = [];

  if (edges.length > 0) {
    const first = edges[0];
    let prevNode = addNode(graph, first);
    concat(addedNodes, prevNode);

    const attributes = parseAttributesAsData(edgeAST.attrList);
    for (let i = 1; i < edges.length; ++i) {
      const nextNode = addNode(graph, edges[i]);
      concat(addedNodes, nextNode);

      addLink(graph, prevNode, nextNode, attributes);
      prevNode = nextNode;
    }
  }

  return addedNodes;
}

function processNodeStatement(
  graph: MyGraph,
  nodeStatement: NodeStmt,
): MyNodeId[] {
  return addNode(graph, nodeStatement.id, nodeStatement.attrList);
}

function concat<T>(head: T[], tail: T[]): T[] {
  head.push(...tail);
  return head;
}

function addNode(
  graph: MyGraph,
  nodeAST: NodeId | Subgraph,
  attributesList?: Attr[],
): MyNodeId[] {
  if (nodeAST.type === 'node_id') {
    const data = mergeNodeDataIfNeeded(
      parseAttributesAsData(attributesList),
      graph.getNode(nodeAST.id),
    );
    if (data) {
      graph.addNode(nodeAST.id, data);
    } else {
      graph.addNode(nodeAST.id);
    }
    return [nodeAST.id];
  } else if (nodeAST.type === 'subgraph') {
    return loadSubgraph(graph, nodeAST);
  }
  throw new Error('Unknown node type');
}

function addLink(
  graph: MyGraph,
  from: MyNodeId[],
  to: MyNodeId[],
  data: MyLinkData,
): void {
  for (let i = 0; i < from.length; ++i) {
    for (let j = 0; j < to.length; ++j) {
      graph.addLink(from[i], to[j], data);
    }
  }
}

function parseAttributesAsData(
  attributesList?: Attr[],
): Record<string, string> {
  const data = Object.create(null);
  if (attributesList?.length) {
    for (const attr of attributesList) {
      if (attr.type !== 'attr' || attr.id === undefined) {
        continue;
      }
      data[attr.id] = attr.eq;
    }
  }
  return data;
}

function mergeNodeDataIfNeeded(
  newData: Record<string, string>,
  oldNode?: MyNode,
): Record<string, string> {
  if (!oldNode?.data) {
    return newData;
  }
  return Object.assign(oldNode.data, newData);
}
