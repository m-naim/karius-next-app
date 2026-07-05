import assert from 'node:assert/strict';
import {
  calculateDailyReturns,
  calculateVolatility,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateMaxDrawdown
} from '../lib/risk-math.ts';

function runTests() {
  // Test daily returns
  console.log('Testing calculateDailyReturns...');
  const values1 = [100, 101, 102.01];
  const returns1 = calculateDailyReturns(values1);
  assert.equal(returns1.length, 2);
  // (101 - 100) / 100 = 0.01
  assert.ok(Math.abs(returns1[0] - 0.01) < 1e-6);
  // (102.01 - 101) / 101 = 0.01
  assert.ok(Math.abs(returns1[1] - 0.01) < 1e-6);

  // Test calculateVolatility
  console.log('Testing calculateVolatility...');
  const constReturns = [0.01, 0.01, 0.01];
  const vol1 = calculateVolatility(constReturns);
  // zero variance
  assert.ok(Math.abs(vol1 - 0) < 1e-6);
  
  const returns2 = [0.01, -0.01, 0.02, -0.02];
  const vol2 = calculateVolatility(returns2);
  // mean = 0
  // variance = (0.0001 + 0.0001 + 0.0004 + 0.0004) / 4 = 0.001 / 4 = 0.00025
  // stdDev = sqrt(0.00025) = 0.015811388
  // annualized = stdDev * sqrt(252)
  const expectedVol2 = 0.015811388 * Math.sqrt(252);
  assert.ok(Math.abs(vol2 - expectedVol2) < 1e-5);

  // Test calculateSharpeRatio
  // Assuming riskFreeRate = 0
  console.log('Testing calculateSharpeRatio...');
  const sharpe1 = calculateSharpeRatio(returns2);
  // mean = 0, so sharpe = 0
  assert.ok(Math.abs(sharpe1 - 0) < 1e-6);

  const returns3 = [0.01, 0.01, 0.01, 0.01];
  // mean = 0.01, stdDev = 0, but Sharpe ratio usually annualized mean / annualized vol. 
  // Wait, if vol is 0, we should return 0 or Infinity. Let's see. Typically we might return 0 or NaN if stdDev is 0.
  // We'll see how we implement it. We can handle it safely by returning 0 when volatility is 0.

  // Let's use a normal array for sharpe
  const returns4 = [0.01, 0.02, 0.00, -0.01];
  // mean = 0.005
  // variance = (0.000025 + 0.000225 + 0.000025 + 0.000225) / 4 = 0.0005 / 4 = 0.000125
  // stdDev = sqrt(0.000125) = 0.0111803
  // annualized return = 0.005 * 252 = 1.26
  // annualized vol = 0.0111803 * sqrt(252) = 0.17748
  // sharpe = 1.26 / 0.17748 = 7.099
  const sharpe4 = calculateSharpeRatio(returns4);
  assert.ok(Math.abs(sharpe4 - 7.0993) < 1e-3);

  // Test calculateSortinoRatio
  console.log('Testing calculateSortinoRatio...');
  const returns5 = [0.01, 0.02, -0.01, -0.02];
  // mean = 0
  // negative returns = [-0.01, -0.02]
  // downside variance = ( (-0.01 - 0)^2 + (-0.02 - 0)^2 ) / 4 
  // Wait, is downside variance calculated with target return 0? Or mean? Standard is target=0. 
  // Downside variance = sum(min(r, 0)^2) / N = (0.0001 + 0.0004) / 4 = 0.000125
  // Downside dev = sqrt(0.000125) = 0.01118
  // Annualized downside dev = 0.01118 * sqrt(252) = 0.17748
  // Sortino = (0 * 252) / 0.17748 = 0
  const sortino5 = calculateSortinoRatio(returns5);
  assert.ok(Math.abs(sortino5 - 0) < 1e-6);

  const returns6 = [0.02, 0.03, -0.01];
  // mean = 0.013333
  // downside variance = (0.0001) / 3 = 0.00003333
  // downside dev = sqrt(0.00003333) = 0.0057735
  // annualized downside dev = 0.0057735 * sqrt(252) = 0.09165
  // annualized return = 0.013333 * 252 = 3.36
  // Sortino = 3.36 / 0.09165 = 36.66
  const sortino6 = calculateSortinoRatio(returns6);
  assert.ok(Math.abs(sortino6 - 36.66) < 1e-1);

  // Test calculateMaxDrawdown
  console.log('Testing calculateMaxDrawdown...');
  const values2 = [100, 110, 99, 88, 105, 120, 108];
  // peak starts at 100
  // peak 110, trough 88 -> drawdown = (110 - 88)/110 = 22/110 = 0.2 (20%)
  // peak 120, trough 108 -> drawdown = 12/120 = 0.1 (10%)
  // Max drawdown = 0.2
  const mdd2 = calculateMaxDrawdown(values2);
  assert.ok(Math.abs(mdd2 - 0.2) < 1e-6);

  console.log('All tests passed.');
}

runTests();
