import React from 'react';
import type { RiskMetrics } from '@/hooks/useRiskMetrics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RiskAnalysisCardProps {
  metrics: RiskMetrics | null;
  loading: boolean;
}

export function RiskAnalysisCard({ metrics, loading }: RiskAnalysisCardProps) {
  if (loading) {
    return (
      <Card className="w-full backdrop-blur-md bg-background/80 border-border/50 animate-pulse">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded"></div>
          <div className="h-4 w-1/4 bg-muted rounded mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatPercent = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getDrawdownColors = (val: number) => {
    if (val > -0.1) return { text: 'text-green-500', bg: 'bg-green-500' };
    if (val > -0.2) return { text: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { text: 'text-red-500', bg: 'bg-red-500' };
  };

  const getSortinoColor = (val: number) => {
    if (val > 1) return 'text-green-500';
    if (val > 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Create a visual representation of the drawdown (progress bar inverted)
  const drawdownPercentage = Math.min(Math.abs(metrics.maxDrawdown * 100), 100);
  const drawdownColors = getDrawdownColors(metrics.maxDrawdown);

  return (
    <Card className="w-full backdrop-blur-md bg-background/80 border-border/50 text-foreground">
      <CardHeader>
        <CardTitle>Risk Analysis</CardTitle>
        <CardDescription>Deeper insights into portfolio risk</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Sortino Ratio</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${getSortinoColor(metrics.sortino)}`}>
                {formatNumber(metrics.sortino)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Measures risk-adjusted return relative to downside volatility. Higher is better.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Max Drawdown</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${drawdownColors.text}`}>
                {formatPercent(metrics.maxDrawdown)}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 mt-2 overflow-hidden flex">
              <div
                className={`h-2.5 rounded-full ${drawdownColors.bg}`}
                style={{ width: `${drawdownPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The maximum observed loss from a peak to a trough of a portfolio. Lower absolute value is better.
            </p>
          </div>

          {metrics.calmar !== undefined && (
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Calmar Ratio</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold">
                  {formatNumber(metrics.calmar)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Measures risk-adjusted return relative to maximum drawdown. Higher is better.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RiskAnalysisCard;
