/**
 * Market Watch page - real-time market data table with filters and pagination.
 * Uses same UI/colors as DashboardPage; data from API with optional socket refresh.
 */

import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Star,
  Plus,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useMarkets } from '../hooks/useMarkets';
import { useMarketWatch } from '../hooks/useMarketWatch';
import type { Market } from '../types/market';
import type { SymbolWithQuote } from '../types/market';

const PAGE_SIZE = 10;
/** Display order for market tabs; filters show in this order when API returns them. */
const MARKET_TAB_CODES = ['NSE', 'MCX', 'OPT', 'BSE', 'CRYPTO', 'FOREX'] as const;
type SortKey = 'code' | 'name' | 'ask' | 'bid' | 'ltp' | 'change' | 'high' | 'low';
type SortOrder = 'asc' | 'desc';

function formatNum(value: number): string {
  return typeof value === 'number' && !Number.isNaN(value)
    ? value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : '–';
}

function formatChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${formatNum(change)}`;
}

export function MarketWatchPage() {
  const { markets, isLoading: marketsLoading } = useMarkets();
  const [selectedMarketId, setSelectedMarketId] = useState<number | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>('code');
  const [order, setOrder] = useState<SortOrder>('asc');

  const {
    data: symbols,
    meta,
    isLoading: symbolsLoading,
    refetch,
  } = useMarketWatch({
    page,
    limit: PAGE_SIZE,
    marketId: selectedMarketId,
    search: appliedSearch || undefined,
    sort,
    order,
    withQuotes: true,
  });

  const handleSaveSearch = useCallback(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length >= 3) {
      setAppliedSearch(trimmed);
      setPage(1);
    }
    refetch();
  }, [searchInput, refetch]);

  const handleSort = useCallback((key: SortKey) => {
    setOrder((prev) => (sort === key && prev === 'asc' ? 'desc' : 'asc'));
    setSort(key);
    setPage(1);
  }, [sort]);

  const totalPages = Math.max(1, Math.ceil(meta.total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, meta.total);

  /** Markets in fixed order (NSE, MCX, OPT, BSE, CRYPTO, FOREX) for tab bar; match by code case-insensitively. */
  const orderedMarkets = MARKET_TAB_CODES.reduce<(Market | null)[]>((acc, code) => {
    const m = markets.find((x: Market) => String(x.code).toUpperCase() === code);
    acc.push(m ?? null);
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header + Script input */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Market Watch</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[160px]">
            <select
              value={selectedMarketId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedMarketId(v ? Number(v) : undefined);
                setPage(1);
              }}
              className={cn(
                'w-full appearance-none rounded-lg border-2 bg-[var(--bg-sidebar)] py-2.5 pl-4 pr-10 text-sm text-[var(--text-primary)]',
                'border-[var(--accent)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30',
                'cursor-pointer transition-colors hover:border-[var(--accent)]/90'
              )}
              aria-label="Select market type"
            >
              <option value="">Select One</option>
              {orderedMarkets.filter((m): m is Market => m != null).map((m: Market) => (
                <option key={m.id} value={m.id}>
                  {m.code}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
          </div>
          <input
            type="text"
            placeholder="Please enter at least 3 characters"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
            className={cn(
              'min-w-[200px] rounded border border-gray-600 bg-[var(--bg-sidebar)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:border-[var(--accent)] focus:outline-none'
            )}
          />
          <button
            type="button"
            onClick={handleSaveSearch}
            className={cn(
              'rounded px-4 py-2 text-sm font-medium text-white',
              'bg-[var(--accent)] hover:opacity-90'
            )}
          >
            Save
          </button>
        </div>
      </div>

      {/* Market filter tabs - visible bar above the table */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-gray-700/50 px-4 py-3"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        <span className="mr-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Market:
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedMarketId(undefined);
            setPage(1);
          }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            selectedMarketId === undefined
              ? 'bg-[var(--accent)] text-white'
              : 'border border-gray-600 text-[var(--text-primary)] hover:bg-white/5'
          )}
        >
          All
        </button>
        {orderedMarkets.map((m, idx) => {
          const code = MARKET_TAB_CODES[idx];
          const isSelected = m != null && selectedMarketId === m.id;
          return (
            <button
              key={m?.id ?? code}
              type="button"
              disabled={m == null}
              onClick={() => {
                if (m != null) {
                  setSelectedMarketId(m.id);
                  setPage(1);
                }
              }}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                m == null
                  ? 'cursor-not-allowed border border-gray-700/50 bg-black/20 text-[var(--text-muted)] opacity-70'
                  : isSelected
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-gray-600 text-[var(--text-primary)] hover:bg-white/5'
              )}
              title={m == null ? `Market ${code} not loaded` : `Filter by ${code}`}
            >
              {code}
            </button>
          );
        })}
      </div>

      {/* Table card - same bg as Dashboard, connects to tab bar */}
      <div
        className="overflow-hidden rounded-b-lg border border-t-0 border-gray-700/50"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        <div className="overflow-x-auto px-5 pb-5 pt-5">
          {marketsLoading || symbolsLoading ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">Loading…</p>
          ) : (
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-gray-700/40">
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    Actions
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('code')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Script
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('ask')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Ask
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('bid')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Bid
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('ltp')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Ltp
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('change')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Change
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('high')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      High
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                    <button
                      type="button"
                      onClick={() => handleSort('low')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Low
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {symbols.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-[var(--text-muted)]">
                      No symbols found. Try another market or search.
                    </td>
                  </tr>
                ) : (
                  symbols.map((row: SymbolWithQuote) => {
                    const q = row.quote;
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-gray-700/40 last:border-b-0"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="text-emerald-500 hover:opacity-80"
                              aria-label="Favorite"
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </button>
                            <button
                              type="button"
                              className="text-amber-500 hover:opacity-80"
                              aria-label="Add"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                          {row.code || row.name}
                        </td>
                        <td className="py-3 pr-4">
                          {q != null ? (
                            <span className="inline-block rounded bg-emerald-600 px-2 py-0.5 text-sm font-medium text-white">
                              {formatNum(q.ask)}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--text-muted)]">–</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                          {q != null ? formatNum(q.bid) : '–'}
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                          {q != null ? formatNum(q.ltp) : '–'}
                        </td>
                        <td className="py-3 pr-4 text-sm font-medium">
                          {q != null ? (
                            <span
                              className={cn(
                                'inline-block rounded px-2 py-0.5 text-white',
                                q.change >= 0 ? 'bg-emerald-600' : 'bg-red-700'
                              )}
                            >
                              {formatChange(q.change)}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">–</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                          {q != null ? formatNum(q.high) : '–'}
                        </td>
                        <td className="py-3 text-sm text-[var(--text-primary)]">
                          {q != null ? formatNum(q.low) : '–'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination - same style as Dashboard */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-700/40 px-5 py-3">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {symbols.length === 0 ? 0 : start}–{end} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 text-[var(--accent)] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40'
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-medium text-white">
              {page}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 text-[var(--accent)] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40'
              )}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
