export function calculateDailyReturns(values: number[]): number[] {
  if (values.length < 2) return [];
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    returns.push(prev === 0 ? 0 : (curr - prev) / prev);
  }
  return returns;
}

export function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  return stdDev * Math.sqrt(252); // Annualized
}

export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = mean * 252;
  const volatility = calculateVolatility(returns);
  
  if (volatility === 0) return 0;
  return (annualizedReturn - riskFreeRate) / volatility;
}

export function calculateSortinoRatio(returns: number[], targetReturn: number = 0): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = mean * 252;
  
  const dailyTargetReturn = targetReturn / 252;
  let downsideVariance = 0;
  for (const r of returns) {
    if (r < dailyTargetReturn) {
      downsideVariance += Math.pow(r - dailyTargetReturn, 2);
    }
  }
  downsideVariance /= returns.length;
  
  const downsideDev = Math.sqrt(downsideVariance);
  const annualizedDownsideDev = downsideDev * Math.sqrt(252);
  
  if (annualizedDownsideDev === 0) return 0;
  return (annualizedReturn - targetReturn) / annualizedDownsideDev;
}

export function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0;
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (v > peak) {
      peak = v;
    } else {
      if (peak !== 0) {
        const drawdown = (peak - v) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }
  }
  return maxDrawdown;
}

export function calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length === 0) return 0;
  
  const meanPortfolio = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
  const meanBenchmark = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
  
  let covariance = 0;
  let varianceBenchmark = 0;
  
  for (let i = 0; i < portfolioReturns.length; i++) {
    const diffPortfolio = portfolioReturns[i] - meanPortfolio;
    const diffBenchmark = benchmarkReturns[i] - meanBenchmark;
    
    covariance += diffPortfolio * diffBenchmark;
    varianceBenchmark += Math.pow(diffBenchmark, 2);
  }
  
  if (varianceBenchmark === 0) return 0;
  return covariance / varianceBenchmark;
}
