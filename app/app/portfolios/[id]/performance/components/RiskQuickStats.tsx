import React from 'react';
import type { RiskMetrics } from '@/hooks/useRiskMetrics';

interface RiskQuickStatsProps {
  metrics: RiskMetrics | null;
  loading: boolean;
}

export function RiskQuickStats({ metrics, loading }: RiskQuickStatsProps) {
  if (loading) {
    return (
      <div className="flex flex-row gap-4 w-full p-4 rounded-xl backdrop-blur-md bg-background/80 border border-border/50 animate-pulse">
        <div className="h-20 flex-1 bg-muted rounded-lg"></div>
        <div className="h-20 flex-1 bg-muted rounded-lg"></div>
        <div className="h-20 flex-1 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatPercent = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'percent', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(val);
  };

  const getSharpeColor = (val: number) => {
    if (val > 1) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (val > 0) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getMaxDrawdownColor = (val: number) => {
    // Max drawdown is typically negative, e.g., -0.15 is -15%
    if (val > -0.1) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (val > -0.2) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getVolatilityColor = (val: number) => {
    if (val < 0.1) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (val < 0.2) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="flex flex-row flex-wrap gap-4 w-full p-4 rounded-xl backdrop-blur-md bg-background/80 border border-border/50 shadow-sm text-foreground">
      <StatBadge 
        label="Sharpe Ratio" 
        value={formatNumber(metrics.sharpe)} 
        colorClass={getSharpeColor(metrics.sharpe)} 
      />
      <StatBadge 
        label="Max Drawdown" 
        value={formatPercent(metrics.maxDrawdown)} 
        colorClass={getMaxDrawdownColor(metrics.maxDrawdown)} 
      />
      <StatBadge 
        label="Volatility" 
        value={formatPercent(metrics.volatility)} 
        colorClass={getVolatilityColor(metrics.volatility)} 
      />
    </div>
  );
}

function StatBadge({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className={`flex-1 min-w-[150px] flex flex-col justify-center items-center p-3 rounded-lg border ${colorClass}`}>
      <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
      <span className="text-2xl font-bold mt-1">{value}</span>
    </div>
  );
}

export default RiskQuickStats;
