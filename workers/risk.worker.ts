import {
  calculateDailyReturns,
  calculateVolatility,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown,
  calculateBeta,
} from '../lib/risk-math';

export interface CalculateMessagePayload {
  values: number[];
  benchmarks?: { [symbol: string]: number[] };
}

export interface CalculateMessage {
  type: 'CALCULATE';
  payload: CalculateMessagePayload;
}

self.addEventListener('message', (event: MessageEvent<CalculateMessage>) => {
  try {
    const data = event.data;
    
    if (data?.type === 'CALCULATE') {
      const { values, benchmarks } = data.payload;
      
      if (!values || !Array.isArray(values)) {
        self.postMessage({ type: 'ERROR', payload: { error: 'Invalid payload' }});
        return;
      }
      
      const returns = calculateDailyReturns(values);
      
      const volatility = calculateVolatility(returns);
      const sharpe = calculateSharpeRatio(returns);
      const sortino = calculateSortinoRatio(returns);
      const maxDrawdown = calculateMaxDrawdown(values);
      
      const benchmarkMetrics: { [symbol: string]: any } = {};

      if (benchmarks && typeof benchmarks === 'object') {
        for (const [symbol, benchValues] of Object.entries(benchmarks)) {
          if (Array.isArray(benchValues) && benchValues.length >= 2) {
            const benchReturns = calculateDailyReturns(benchValues);
            const benchVol = calculateVolatility(benchReturns);
            const benchSharpe = calculateSharpeRatio(benchReturns);
            const benchSortino = calculateSortinoRatio(benchReturns);
            const benchDD = calculateMaxDrawdown(benchValues);
            
            // Align returns to match length for Beta calculation
            const minLength = Math.min(returns.length, benchReturns.length);
            const alignedReturns = returns.slice(0, minLength);
            const alignedBenchReturns = benchReturns.slice(0, minLength);
            const beta = calculateBeta(alignedReturns, alignedBenchReturns);
            
            benchmarkMetrics[symbol] = {
              volatility: benchVol,
              sharpe: benchSharpe,
              sortino: benchSortino,
              maxDrawdown: benchDD,
              beta,
            };
          }
        }
      }
      
      self.postMessage({
        type: 'RESULT',
        payload: {
          sharpe,
          sortino,
          maxDrawdown,
          volatility,
          benchmarks: benchmarkMetrics,
        }
      });
    }
  } catch (error: unknown) {
    self.postMessage({ type: 'ERROR', payload: { error: error instanceof Error ? error.message : 'Calculation error' }});
  }
});
