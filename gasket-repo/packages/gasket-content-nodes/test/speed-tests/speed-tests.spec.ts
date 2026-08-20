import { reverseTraverse, reverseTraverseAsync, transform, traverse, reverseTransformNodesAsync } from '../../src';
import simpleDelegate, { trackingToUnderscore } from '../fixtures/simple-delegate';
import { simpleContentVisitor, complexContentVisitor } from '../fixtures/transform-visitors';
import complexDelegate from '../fixtures/complex-delegate';
import { buildPerformanceData, buildPerformanceDataAsync } from './performance-utils';
import pkg from '../fixtures/page-node.json' with { type: 'json' };
const pageContentNode = pkg.default || pkg;

function buildTestTitle(runs, delegateType) {
  return `executes ${runs} runs on a ${delegateType} delegate`;
}

const SIMPLE = 'SIMPLE';
const COMPLEX = 'COMPLEX';

describe('performance tests', function () {
  const performanceData: any[] = [];

  afterAll(function () {
    // eslint-disable-next-line no-console
    console.table(performanceData);
  });

  describe('traverse', function () {
    const name = 'traverse';
    const simpleDelegateTraverse = () => traverse(pageContentNode, simpleDelegate);
    const complexDelegateTraverse = () => traverse(pageContentNode, complexDelegate);

    it(buildTestTitle(10, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateTraverse,
          10
        )
      );
    });

    it(buildTestTitle(100, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateTraverse,
          100
        )
      );
    });

    it(buildTestTitle(1000, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateTraverse,
          1000
        )
      );
    });

    it(buildTestTitle(10, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateTraverse,
          10
        )
      );
    });

    it(buildTestTitle(100, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateTraverse,
          100
        )
      );
    });

    it(buildTestTitle(1000, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateTraverse,
          1000
        )
      );
    });
  });

  describe('reverseTraverse', function () {
    const name = 'reverseTraverse';
    const simpleDelegateReverseTraverse = () => reverseTraverse(pageContentNode, simpleDelegate);
    const complexDelegateReverseTraverse = () => reverseTraverse(pageContentNode, complexDelegate);

    it(buildTestTitle(10, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateReverseTraverse,
          10
        )
      );
    });

    it(buildTestTitle(100, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateReverseTraverse,
          100
        )
      );
    });

    it(buildTestTitle(1000, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateReverseTraverse,
          1000
        )
      );
    });

    it(buildTestTitle(10, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateReverseTraverse,
          10
        )
      );
    });

    it(buildTestTitle(100, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateReverseTraverse,
          100
        )
      );
    });

    it(buildTestTitle(1000, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateReverseTraverse,
          1000
        )
      );
    });
  });

  describe('transform', function () {
    const name = 'transform';
    const simpleDelegateTransform = () => transform(pageContentNode, simpleContentVisitor);
    const complexDelegateTransform = () => transform(pageContentNode, complexContentVisitor);

    it(buildTestTitle(10, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateTransform,
          10
        )
      );
    });

    it(buildTestTitle(100, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateTransform,
          100
        )
      );
    });

    it(buildTestTitle(1000, SIMPLE), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          SIMPLE,
          simpleDelegateTransform,
          1000
        )
      );
    });

    it(buildTestTitle(10, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateTransform,
          10
        )
      );
    });

    it(buildTestTitle(100, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateTransform,
          100
        )
      );
    });

    it(buildTestTitle(1000, COMPLEX), function () {
      performanceData.push(
        buildPerformanceData(
          name,
          COMPLEX,
          complexDelegateTransform,
          1000
        )
      );
    });
  });

  describe('reverseTraverseAsync', function () {
    const name = 'reverseTraverseAsync';
    const simpleDelReverseTraverseAsync = async () => await reverseTraverseAsync(pageContentNode, simpleDelegate);
    const complexDelReverseTraverseAsync = async () => await reverseTraverseAsync(pageContentNode, complexDelegate);

    it(buildTestTitle(10, SIMPLE), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          SIMPLE,
          simpleDelReverseTraverseAsync,
          10
        )
      );
    });

    it(buildTestTitle(100, SIMPLE), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          SIMPLE,
          simpleDelReverseTraverseAsync,
          100
        )
      );
    });

    it(buildTestTitle(1000, SIMPLE), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          SIMPLE,
          simpleDelReverseTraverseAsync,
          1000
        )
      );
    });

    it(buildTestTitle(10, COMPLEX), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          COMPLEX,
          complexDelReverseTraverseAsync,
          10
        )
      );
    });

    it(buildTestTitle(100, COMPLEX), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          COMPLEX,
          complexDelReverseTraverseAsync,
          100
        )
      );
    });

    it(buildTestTitle(1000, COMPLEX), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          COMPLEX,
          complexDelReverseTraverseAsync,
          1000
        )
      );
    });
  });

  describe('reverseTransformNodesAsync', function () {
    const name = 'reverseTransformNodesAsync';
    const simpDelRevTransformNodesAsync = async () =>
      await reverseTransformNodesAsync(pageContentNode, 'LocalizedString', trackingToUnderscore);
    const compDelRevTransformNodesAsync = async () =>
      await reverseTransformNodesAsync(pageContentNode, 'BynderImage', trackingToUnderscore);

    it(buildTestTitle(10, SIMPLE), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          SIMPLE,
          simpDelRevTransformNodesAsync,
          10
        )
      );
    });

    it(buildTestTitle(100, SIMPLE), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          SIMPLE,
          simpDelRevTransformNodesAsync,
          100
        )
      );
    });

    it(buildTestTitle(1000, SIMPLE), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          SIMPLE,
          simpDelRevTransformNodesAsync,
          1000
        )
      );
    });

    it(buildTestTitle(10, COMPLEX), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          COMPLEX,
          compDelRevTransformNodesAsync,
          10
        )
      );
    });

    it(buildTestTitle(100, COMPLEX), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          COMPLEX,
          compDelRevTransformNodesAsync,
          100
        )
      );
    });

    it(buildTestTitle(1000, COMPLEX), async function () {
      performanceData.push(
        await buildPerformanceDataAsync(
          name,
          COMPLEX,
          compDelRevTransformNodesAsync,
          1000
        )
      );
    });
  });
});
