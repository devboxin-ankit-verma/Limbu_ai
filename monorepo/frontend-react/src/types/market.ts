/**
 * Market and symbol types - aligned with backend API.
 */

export interface Market {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketQuote {
  ask: number;
  bid: number;
  ltp: number;
  change: number;
  high: number;
  low: number;
  updatedAt: string;
}

export interface SymbolWithQuote {
  id: number;
  code: string;
  name: string;
  marketId: number;
  lotSize: number | string;
  tickSize: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  market?: Market;
  quote: MarketQuote | null;
}
