import {
  calculateDailyReturns,
  calculateVolatility,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown,
} from '../lib/risk-math';

export interface CalculateMessagePayload {
  values: number[];
  benchmarkValues?: number[];
}

export interface CalculateMessage {
  type: 'CALCULATE';
  payload: CalculateMessagePayload;
}

self.addEventListener('message', (event: MessageEvent<CalculateMessage>) => {
  try {
    const data = event.data;
    
    if (data?.type === 'CALCULATE') {
      const { values } = data.payload;
      
      if (!values || !Array.isArray(values)) {
        self.postMessage({ type: 'ERROR', payload: { error: 'Invalid payload' }});
        return;
      }
      
      const returns = calculateDailyReturns(values);
      
      const volatility = calculateVolatility(returns);
      const sharpe = calculateSharpeRatio(returns);
      const sortino = calculateSortinoRatio(returns);
      const maxDrawdown = calculateMaxDrawdown(values);
      
      self.postMessage({
        type: 'RESULT',
        payload: {
          sharpe,
          sortino,
          maxDrawdown,
          volatility,
        }
      });
    }
  } catch (error: unknown) {
    self.postMessage({ type: 'ERROR', payload: { error: error instanceof Error ? error.message : 'Calculation error' }});
  }
});
