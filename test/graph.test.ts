import { type Change, Graph } from '../graph.ts';
import { assert, assertEquals } from '$std/assert/mod.ts';
import { assertSpyCalls, spy } from '$std/testing/mock.ts';

Deno.test('Graph', async (t) => {
  await t.step('construction', async (t) => {
    await t.step('add node adds node', () => {
      const graph = new Graph<string, undefined, number>();
      const customData = '31337';
      const node = graph.addNode(1, customData);

      assertEquals(graph.nodeCount, 1);
      assertEquals(graph.linkCount, 0);
      assertEquals(graph.getNode(1), node);
      assertEquals(node.data, customData);
      assertEquals(node.id, 1);
    });

    await t.step('hasNode checks node', () => {
      const graph = new Graph<number, number, number>();

      graph.addNode(1);

      assert(graph.getNode(1));
      assert(!graph.getNode(2));
    });

    await t.step('hasLink checks links', () => {
      const graph = new Graph<number, number, number>();
      graph.addLink(1, 2);
      const link12 = graph.getLink(1, 2);
      assertEquals(link12?.fromId, 1);
      assertEquals(link12?.toId, 2);

      assert(graph.addLink(2, 3));

      // this is somewhat doubtful... has link will return null, but forEachLinkedNode
      // will actually iterate over this link. Not sure how to have consistency here
      // for now documenting behavior in the test:
      assert(!graph.getLink(2, 1));
      assert(!graph.getLink(1, null!));
      assert(!graph.getLink(null!, 2));
      assert(!graph.getLink(null!, null!));
    });

    await t.step('it fires update event when node is updated', () => {
      function checkChangedEvent(
        changes: Change<string, string, number>[],
      ): void {
        assertEquals(changes.length, 1);
        const [change] = changes;
        assert(change.type === 'node'); // ts doesn't understand assertEquals
        assertEquals(change.node.id, 1);
        assertEquals(change.node.data, 'world');
        assertEquals(change.changeType, 'update');
      }

      const graph = new Graph<string, string, number>();
      graph.addNode(1, 'hello');
      const mockCheck = spy(checkChangedEvent);
      graph.on('changed', mockCheck);
      graph.addNode(1, 'world');
      assertSpyCalls(mockCheck, 1);
    });

    // await t.step('it can add node with id similar to reserved prototype property', function(t) {
    //   const graph = new Graph<number, number, number>();
    //   graph.addNode('constructor');
    //   graph.addLink('watch', 'constructor');

    //   const iterated = 0;
    //   graph.forEachNode(function() {
    //     iterated += 1;
    //   });

    //   t.ok(graph.hasLink('watch', 'constructor'));
    //   t.equal(graph.getLinksCount(), 1, 'one link');
    //   t.equal(iterated, 2, 'has two nodes');
    //   t.end();
    // });

    // await t.step('add link adds link', function(t) {
    //   const graph = new Graph<number, number, number>();

    //   const link = graph.addLink(1, 2),
    //     firstNodeLinks = graph.getLinks(1),
    //     secondNodeLinks = graph.getLinks(2);

    //   t.equal(graph.getNodesCount(), 2, 'Two nodes');
    //   t.equal(graph.getLinksCount(), 1, 'One link');
    //   t.equal(firstNodeLinks.size, 1, 'number of links of the first node is wrong');
    //   t.equal(secondNodeLinks.size, 1, 'number of links of the second node is wrong');
    //   t.equal(link, Array.from(firstNodeLinks)[0], 'invalid link in the first node');
    //   t.equal(link, Array.from(secondNodeLinks)[0], 'invalid link in the second node');
    //   t.end();
    // });

    // await t.step('it can add multi-edges', (t) => {
    //   t.plan(5);
    //   const graph = new Graph<number, number, number>({multigraph: true});
    //   graph.addLink(1, 2, 'first');
    //   graph.addLink(1, 2, 'second');
    //   graph.addLink(1, 2, 'third');

    //   t.equal(graph.getLinksCount(), 3, 'three links!');
    //   t.equal(graph.getNodesCount(), 2, 'Two nodes');

    //   graph.forEachLinkedNode(1, function (otherNode, link) {
    //     t.ok(link.data === 'first' || link.data === 'second' || link.data === 'third', 'Link is here');
    //   });

    //   t.end();
    // });

    // await t.step('it can produce unique link ids', (t) => {
    //   // eslint-disable-next-line no-shadow
    //   t.await t.step('by default links are de-duped', (t) => {
    //     const seen = {};
    //     const graph = new Graph<number, number, number>();
    //     graph.addLink(1, 2, 'first');
    //     graph.addLink(1, 2, 'second');
    //     graph.addLink(1, 2, 'third');
    //     graph.forEachLink(verifyLinksAreNotUnique);

    //     const link = graph.getLink(1, 2);
    //     t.equal(seen[link.id], 1, 'Link 1->2 seen 1 time');
    //     t.equal(link.data, 'third', 'Last link wins');

    //     // eslint-disable-next-line no-shadow
    //     function verifyLinksAreNotUnique(link) {
    //       seen[link.id] = (seen[link.id] || 0) + 1;
    //     }
    //     t.end();
    //   });

    //   // eslint-disable-next-line no-shadow
    //   t.await t.step('You can create multigraph', (t) => {
    //     const graph = new Graph<number, number, number>({
    //       multigraph: true
    //     });

    //     const seen = {};
    //     graph.addLink(1, 2, 'first');
    //     graph.addLink(1, 2, 'second');
    //     graph.addLink(1, 2, 'third');
    //     graph.forEachLink(verifyLinkIsUnique);
    //     t.equal(graph.getLinksCount(), 3, 'All three links are here');
    //     t.end();

    //     function verifyLinkIsUnique(link) {
    //       t.notOk(seen[link.id], link.id + ' is unique');
    //       seen[link.id] = true;
    //     }
    //   });

    //   t.end();
    // });

    // await t.step('add one node fires changed event', function(t) {
    //   t.plan(3);
    //   const graph = new Graph<number, number, number>();
    //   const testNodeId = 'hello world';

    //   graph.on('changed', function(changes) {
    //     t.ok(changes && changes.length === 1, "Only one change should be recorded");
    //     t.equal(changes[0].node.id, testNodeId, "Wrong node change notification");
    //     t.equal(changes[0].changeType, 'add', "Add change type expected.");
    //   });

    //   graph.addNode(testNodeId);

    //   t.end();
    // });

    // await t.step('add link fires changed event', function(t) {
    //   t.plan(4);
    //   const graph = new Graph<number, number, number>();
    //   const fromId = 1,
    //     toId = 2;

    //   graph.on('changed', function(changes) {
    //     t.ok(changes && changes.length === 3, "Three change should be recorded: node, node and link");
    //     t.equal(changes[2].link.fromId, fromId, "Wrong link from Id");
    //     t.equal(changes[2].link.toId, toId, "Wrong link toId");
    //     t.equal(changes[2].changeType, 'add', "Add change type expected.");
    //   });

    //   graph.addLink(fromId, toId);
    //   t.end();
    // });

    // await t.step('remove isolated node remove it', function(t) {
    //   const graph = new Graph<number, number, number>();

    //   graph.addNode(1);
    //   graph.removeNode(1);

    //   t.equal(graph.getNodesCount(), 0, 'Remove operation failed');
    //   t.end();
    // });

    // await t.step('supports plural methods', function(t) {
    //   const graph = new Graph<number, number, number>();

    //   graph.addLink(1, 2);

    //   t.equal(graph.getNodeCount(), 2, 'two nodes are there');
    //   t.equal(graph.getLinkCount(), 1, 'two nodes are there');

    //   t.equal(graph.getNodesCount(), 2, 'two nodes are there');
    //   t.equal(graph.getLinksCount(), 1, 'two nodes are there');

    //   t.end();
    // });

    // await t.step('remove link removes it', function(t) {
    //   t.plan(5);

    //   const graph = new Graph<number, number, number>();
    //   const link = graph.addLink(1, 2);

    //   const linkIsRemoved = graph.removeLink(link);

    //   t.equal(graph.getNodesCount(), 2, 'remove link should not remove nodes');
    //   t.equal(graph.getLinksCount(), 0, 'No Links');
    //   t.equal(graph.getLinks(1).size, 0, 'link should be removed from the first node');
    //   t.equal(graph.getLinks(2).size, 0, 'link should be removed from the second node');
    //   t.ok(linkIsRemoved, 'Link removal is successful');

    //   graph.forEachLink(function() {
    //     test.ok(false, 'No links should be in graph');
    //   });

    //   t.end();
    // });

    // await t.step('it can remove link by from/to ids', function(t) {
    //   const graph = new Graph<number, number, number>();
    //   graph.addLink(1, 2);

    //   const linkIsRemoved = graph.removeLink(1, 2);

    //   t.equal(graph.getNodesCount(), 2, 'remove link should not remove nodes');
    //   t.equal(graph.getLinksCount(), 0, 'No Links');
    //   t.equal(graph.getLinks(1).size, 0, 'link should be removed from the first node');
    //   t.equal(graph.getLinks(2).size, 0, 'link should be removed from the second node');
    //   t.ok(linkIsRemoved, 'Link removal is successful');

    //   graph.forEachLink(function() {
    //     test.ok(false, 'No links should be in graph');
    //   });

    //   t.end();
    // });

    // await t.step('remove link returns false if no link removed', (t) => {
    //   const graph = new Graph<number, number, number>();

    //   graph.addLink(1, 2);
    //   const result = graph.removeLink('blah');
    //   t.notOk(result, 'Link is not removed');

    //   const alsoNo = graph.removeLink();
    //   t.notOk(alsoNo, 'No link - no removal');
    //   t.end();
    // });

    // await t.step('remove isolated node fires changed event', function(t) {
    //   t.plan(4);
    //   const graph = new Graph<number, number, number>();
    //   graph.addNode(1);

    //   graph.on('changed', function(changes) {
    //     t.ok(changes && changes.length === 1, "One change should be recorded: node removed");
    //     t.equal(changes[0].node.id, 1, "Wrong node Id");
    //     t.equal(changes[0].changeType, 'remove', "'remove' change type expected.");
    //   });

    //   const result = graph.removeNode(1);
    //   t.ok(result, 'node is removed');
    //   t.end();
    // });

    // await t.step('remove link fires changed event', function(t) {
    //   t.plan(3);
    //   const graph = new Graph<number, number, number>();
    //   const link = graph.addLink(1, 2);

    //   graph.on('changed', function(changes) {
    //     t.ok(changes && changes.length === 1, "One change should be recorded: link removed");
    //     t.equal(changes[0].link, link, "Wrong link removed");
    //     t.equal(changes[0].changeType, 'remove', "'remove' change type expected.");
    //   });

    //   graph.removeLink(link);
    //   t.end();
    // });

    // await t.step('remove linked node fires changed event', function(t) {
    //   t.plan(5);
    //   const graph = new Graph<number, number, number>(),
    //     link = graph.addLink(1, 2),
    //     nodeIdToRemove = 1;

    //   graph.on('changed', function(changes) {
    //     t.ok(changes && changes.length === 2, "Two changes should be recorded: link and node removed");
    //     t.equal(changes[0].link, link, "Wrong link removed");
    //     t.equal(changes[0].changeType, 'remove', "'remove' change type expected.");
    //     t.equal(changes[1].node.id, nodeIdToRemove, "Wrong node removed");
    //     t.equal(changes[1].changeType, 'remove', "'remove' change type expected.");
    //   });

    //   graph.removeNode(nodeIdToRemove);
    //   t.end();
    // });

    // await t.step('remove node with many links removes them all', function(t) {
    //   const graph = new Graph<number, number, number>();
    //   graph.addLink(1, 2);
    //   graph.addLink(1, 3);

    //   graph.removeNode(1);

    //   t.equal(graph.getNodesCount(), 2, 'remove link should remove one node only');
    //   t.equal(graph.getLinks(1), null, 'link should be removed from the first node');
    //   t.equal(graph.getLinks(2).size, 0, 'link should be removed from the second node');
    //   t.equal(graph.getLinks(3).size, 0, 'link should be removed from the third node');
    //   graph.forEachLink(function() {
    //     test.ok(false, 'No links should be in graph');
    //   });

    //   t.end();
    // });

    // await t.step('remove node returns false when no node removed', (t) => {
    //   const graph = new Graph<number, number, number>();
    //   graph.addNode('hello');
    //   const result = graph.removeNode('blah');
    //   t.notOk(result, 'No "blah" node');
    //   t.end();
    // });

    // await t.step('clearGraph clears graph', (t) => {
    //   const graph = new Graph<number, number, number>();
    //   graph.addNode('hello');
    //   graph.addLink(1, 2);
    //   graph.clear();

    //   t.equal(graph.getNodesCount(), 0, 'No nodes');
    //   t.equal(graph.getLinksCount(), 0, 'No links');
    //   t.end();
    // });

    // await t.step('beginUpdate holds events', function(t) {
    //   const graph = new Graph<number, number, number>();
    //   const changedCount = 0;
    //   graph.on('changed', function () {
    //     changedCount += 1;
    //   });
    //   graph.beginUpdate();
    //   graph.addNode(1);
    //   t.equal(changedCount, 0, 'Begin update freezes updates until `endUpdate()`');
    //   graph.endUpdate();
    //   t.equal(changedCount, 1, 'event is fired only after endUpdate()');
    //   t.end();
    // });
  });
});
