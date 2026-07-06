import { useState, useEffect } from 'react';
import { getCache, setCache } from '../lib/idb-cache';
import { getPerformances } from '../services/portfolioService';

export interface RiskMetrics {
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  volatility: number;
  calmar?: number;
}

export function useRiskMetrics(portfolioId: string) {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let worker: Worker | null = null;
    let isMounted = true;

    async function loadMetrics() {
      if (!portfolioId) {
        if (isMounted) {
          setLoading(false);
          setMetrics(null);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
          setMetrics(null);
        }
        
        const cacheKey = `risk-${portfolioId}`;
        const cached = await getCache(cacheKey);
        
        if (!isMounted) return;

        const today = new Date().toISOString().split('T')[0];

        if (cached && cached.timestamp === today && cached.data) {
          if (isMounted) {
            setMetrics(cached.data);
            setLoading(false);
          }
          return;
        }

        const performanceData = await getPerformances(portfolioId, [], 0);
        
        if (!performanceData || !performanceData.value) {
          throw new Error('Invalid performance data received');
        }

        if (!isMounted) return;

        worker = new Worker(new URL('../workers/risk.worker.ts', import.meta.url));

        worker.onmessage = async (event) => {
          if (!isMounted) {
            if (worker) worker.terminate();
            return;
          }
          
          const { type, payload } = event.data;
          
          if (type === 'RESULT') {
            if (worker) worker.terminate();
            const calculatedMetrics = payload as RiskMetrics;
            
            try {
              await setCache(cacheKey, {
                timestamp: today,
                data: calculatedMetrics
              });
            } catch (err) {
              console.error('Failed to save to cache', err);
            }
            
            if (isMounted) {
              setMetrics(calculatedMetrics);
              setLoading(false);
            }
          } else if (type === 'ERROR') {
            if (worker) worker.terminate();
            setError(payload.error || 'Calculation error');
            setLoading(false);
          }
        };

        worker.onerror = () => {
          if (worker) worker.terminate();
          if (!isMounted) return;
          setError('Worker error');
          setLoading(false);
        };

        worker.postMessage({
          type: 'CALCULATE',
          payload: {
            values: performanceData.value
          }
        });

      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load metrics');
          setLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
      if (worker) {
        worker.terminate();
      }
    };
  }, [portfolioId]);

  return { metrics, loading, error };
}
