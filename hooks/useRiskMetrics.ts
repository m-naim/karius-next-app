import { useState, useEffect } from 'react';
import { getCache, setCache } from '../lib/idb-cache';
import { getPerformances } from '../services/portfolioService';

export interface RiskMetrics {
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  volatility: number;
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
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        const cacheKey = `risk-${portfolioId}`;
        const cached = await getCache(cacheKey);
        
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

        worker = new Worker(new URL('../workers/risk.worker.ts', import.meta.url));

        worker.onmessage = async (event) => {
          if (!isMounted) return;
          
          const { type, payload } = event.data;
          
          if (type === 'RESULT') {
            const calculatedMetrics = payload as RiskMetrics;
            setMetrics(calculatedMetrics);
            
            await setCache(cacheKey, {
              timestamp: today,
              data: calculatedMetrics
            });
            
            setLoading(false);
          } else if (type === 'ERROR') {
            setError(payload.error || 'Calculation error');
            setLoading(false);
          }
        };

        worker.onerror = () => {
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
