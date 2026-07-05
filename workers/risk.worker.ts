import {
  calculateDailyReturns,
  calculateVolatility,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown,
} from '../lib/risk-math';

self.addEventListener('message', (event: MessageEvent) => {
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
        volatility
      }
    });
  }
});
