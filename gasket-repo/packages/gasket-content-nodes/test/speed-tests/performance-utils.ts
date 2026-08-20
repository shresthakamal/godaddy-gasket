function calcMeanAndStandardDeviation(measurements: number[]) {
  const mean = measurements.reduce((acc, time) => acc + time, 0) / measurements.length;
  const standardDeviation = Math.sqrt(measurements.map(x => Math.pow(x - mean, 2))
    .reduce((a, b) => a + b) / measurements.length);
  return { mean, standardDeviation };
}

class RowData {
  Function: string;
  Delegate: string;
  Runs: number;
  Variance: string;
  Mean: string;
  //  eslint-disable-next-line max-params
  constructor(fnName, delegate, runs, variance, mean) {
    this.Function = fnName;
    this.Delegate = delegate;
    this.Runs = runs;
    this.Variance = `${variance.toFixed(2)} ms`;
    this.Mean = `${mean.toFixed(2)} ms`;
  }
}

export function buildPerformanceData(fnName, delegate, fn, numberOfRuns) {
  const measurements: number[] = [];

  for (let i = 0; i < numberOfRuns; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    measurements.push(end - start);
  }

  const { mean, standardDeviation } = calcMeanAndStandardDeviation(measurements);

  return new RowData(fnName, delegate, numberOfRuns, standardDeviation, mean);
}

export async function buildPerformanceDataAsync(fnName, delegate, fn, numberOfRuns) {
  const measurements: number[] = [];

  for (let i = 0; i < numberOfRuns; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    measurements.push(end - start);
  }

  const { mean, standardDeviation } = calcMeanAndStandardDeviation(measurements);

  return new RowData(fnName, delegate, numberOfRuns, standardDeviation, mean);
}
