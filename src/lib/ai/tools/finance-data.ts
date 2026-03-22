import { z } from "zod";

const financeParams = z.object({
  symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, GOOGL, TSLA)"),
  data_type: z
    .enum(["quote", "fundamentals", "history"])
    .describe("quote = current price, fundamentals = P/E ratio etc, history = 6mo price data"),
});

// Yahoo Finance data — no API key needed
export function createFinanceDataTool() {
  return {
    description:
      "Get stock market data: current price, fundamentals (P/E, market cap), or price history. Use stock ticker symbols like AAPL, GOOGL, TSLA.",
    parameters: financeParams,
    execute: async ({ symbol, data_type }: z.infer<typeof financeParams>) => {
      const ticker = symbol.toUpperCase().trim();

      try {
        if (data_type === "quote") {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`,
            { signal: AbortSignal.timeout(8000) }
          );
          const data = await res.json();
          const meta = data.chart?.result?.[0]?.meta;
          if (!meta) return { error: `No data found for ${ticker}` };

          const change = meta.regularMarketPrice - meta.previousClose;
          return {
            symbol: ticker,
            price: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            change: change.toFixed(2),
            changePercent: ((change / meta.previousClose) * 100).toFixed(2) + "%",
            currency: meta.currency,
            exchange: meta.exchangeName,
            marketState: meta.marketState,
          };
        }

        if (data_type === "fundamentals") {
          const res = await fetch(
            `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,summaryDetail`,
            { signal: AbortSignal.timeout(8000) }
          );
          const data = await res.json();
          const result = data.quoteSummary?.result?.[0];
          if (!result) return { error: `No fundamentals found for ${ticker}` };

          const fin = result.financialData || {};
          const stats = result.defaultKeyStatistics || {};
          const summary = result.summaryDetail || {};

          return {
            symbol: ticker,
            marketCap: summary.marketCap?.fmt || "N/A",
            peRatio: summary.trailingPE?.fmt || "N/A",
            forwardPE: summary.forwardPE?.fmt || "N/A",
            dividendYield: summary.dividendYield?.fmt || "N/A",
            fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh?.fmt || "N/A",
            fiftyTwoWeekLow: summary.fiftyTwoWeekLow?.fmt || "N/A",
            revenue: fin.totalRevenue?.fmt || "N/A",
            profitMargin: fin.profitMargins?.fmt || "N/A",
            targetMeanPrice: fin.targetMeanPrice?.fmt || "N/A",
            recommendationKey: fin.recommendationKey || "N/A",
            numberOfAnalysts: fin.numberOfAnalystOpinions?.raw || 0,
            beta: stats.beta?.fmt || "N/A",
            earningsGrowth: fin.earningsGrowth?.fmt || "N/A",
            revenueGrowth: fin.revenueGrowth?.fmt || "N/A",
          };
        }

        if (data_type === "history") {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`,
            { signal: AbortSignal.timeout(8000) }
          );
          const data = await res.json();
          const result = data.chart?.result?.[0];
          if (!result) return { error: `No history found for ${ticker}` };

          const timestamps: number[] = result.timestamp || [];
          const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];

          const points = [];
          for (let i = 0; i < timestamps.length; i += 5) {
            if (closes[i] != null) {
              points.push({
                date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
                close: Number(closes[i]!.toFixed(2)),
              });
            }
          }

          return { symbol: ticker, period: "6mo", dataPoints: points.length, data: points };
        }

        return { error: "Unknown data_type" };
      } catch (err) {
        return {
          error: `Failed to fetch ${data_type} for ${ticker}: ${err instanceof Error ? err.message : "Unknown error"}`,
        };
      }
    },
  };
}
