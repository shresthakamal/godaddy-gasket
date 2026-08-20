// @ts-ignore - no types
import RUM from 'next-rum';

// next-rum is an ESModule
// Next runtime is CJS
const rum = RUM.default || RUM;

/**
 * Next.js has a built-in layer that allows you to analyze and measure the
 * performance of pages using different metrics. This function is fired when the
 * final values for any of the metrics have finished calculating on the page.
 * @type {import('@godaddy/gasket-next').reportWebVitals}
 */
export default function reportWebVitals(metric) {
  if (metric.name === 'Next.js-render') {
    rum.webVitals.renderDuration = metric.value;
  }
  if (metric.name === 'Next.js-route-change-to-render') {
    rum.webVitals.navigationStart = Date.now() - metric.startTime;
    if (rum.webVitals.renderDuration) {
      rum.webVitals.loadEventStart = Date.now() - rum.webVitals.renderDuration;
      rum.webVitals.loadEventEnd = Date.now();
    }
  }
}
