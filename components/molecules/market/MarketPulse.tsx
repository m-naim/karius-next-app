"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Activity } from "lucide-react";
import { getQuotes } from "@/services/stock.service";
import VariationContainer from "@/components/molecules/portfolio/variationContainer";
import { DataFreshness } from "@/components/molecules/DataFreshness";
import { quoteFreshness } from "@/lib/data-freshness";
import { Skeleton } from "@/components/ui/skeleton";

const marketSymbols = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^FCHI", label: "CAC 40" },
  { symbol: "^STOXX50E", label: "EURO STOXX 50" },
];

export function MarketPulse() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchMarketPulse = async () => {
      try {
        const data = await getQuotes(marketSymbols.map(({ symbol }) => symbol));
        if (active) setMarketData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch market pulse", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMarketPulse();
    const intervalId = window.setInterval(fetchMarketPulse, 90_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="h-9 w-full border-b border-border/70 bg-muted/35">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-3 px-3 sm:px-4 lg:px-6">
        <Link
          href="/app/market"
          className="inline-flex h-full shrink-0 items-center gap-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Voir les marchés"
        >
          <Activity className="h-3 w-3 text-primary" />
          <span className="hidden sm:inline">MARCHÉS</span>
        </Link>
        <div className="flex h-full min-w-0 flex-1 items-center gap-0 overflow-x-auto no-scrollbar">
          {loading
            ? marketSymbols.slice(0, 3).map(({ symbol }) => (
                <div
                  key={symbol}
                  className="flex h-full shrink-0 items-center gap-2 border-l border-border/60 px-3 first:border-l-0"
                >
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))
            : marketSymbols.map(({ symbol, label }) => {
                const quote = marketData.find((item) => item.symbol === symbol);
                return (
                  <div
                    key={symbol}
                    className="flex h-full shrink-0 items-center gap-2 border-l border-border/60 px-3 first:border-l-0"
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {label}
                    </span>
                    <DataFreshness info={quoteFreshness(quote || { symbol })}>
                    <span className="text-[10px] font-medium tabular-nums text-foreground">
                      {quote?.regularMarketPrice != null
                        ? Number(quote.regularMarketPrice).toLocaleString(
                            "fr-FR",
                            { maximumFractionDigits: 2 }
                          )
                        : "—"}
                    </span>
                    </DataFreshness>
                    {quote?.regularMarketChangePercent != null ? (
                      <VariationContainer
                        value={quote.regularMarketChangePercent}
                        entity="%"
                        background={false}
                        className="m-0 p-0 text-[10px] font-semibold"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>
                );
              })}
        </div>
        <Link
          href="/app/market"
          className="hidden shrink-0 items-center text-muted-foreground hover:text-foreground sm:inline-flex"
          aria-label="Ouvrir les marchés"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
