# Collecting/Reporting RUM Data with Web Vitals

## ReportWebVitals Function

Next.js has a built-in relayer that allows you to analyze and measure the performance of pages using different metrics.

The reportWebVitals function is made available by Next.js and allows the user to measure any of their supported metrics. This function will be triggered automatically anytime the final values for any of the supported metrics have finished calculating on the page.

See https://nextjs.org/docs/advanced-features/measuring-performance for more details.

Currently, gasket is using this reportWebVitals function to update four metrics: the render duration, navigation start time, loading event start time, and loading event end time. These metrics are collected by the `next-rum` plugin and sent to your RUM dashboard via the `add_virtual_page_perf` schema.

## Setup
To utilize the web vitals reporting, you will need to import the `reportWebVitals` function from `@godaddy/gasket-next` plugin into your `_app.js` file.
```
import { reportWebVitals } from '@godaddy/gasket-next';
```

You will then want to export this function.
```
export { reportWebVitals };
```

In newer Gasket applications, this setup will be taken care of for you already.