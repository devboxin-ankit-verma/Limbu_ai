import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart2, Users, DollarSign, Percent, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { useDashboard } from '../hooks/useDashboard';

function formatCr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  return `₹${n.toLocaleString()}`;
}

const PNL_MOCK = [
  { time: '09:15', pnl: 0 },
  { time: '09:45', pnl: 5 },
  { time: '10:15', pnl: 12 },
  { time: '10:45', pnl: 8 },
  { time: '11:15', pnl: 18 },
  { time: '11:45', pnl: 22 },
  { time: '12:15', pnl: 15 },
  { time: '12:45', pnl: 28 },
  { time: '13:15', pnl: 35 },
  { time: '13:45', pnl: 42 },
  { time: '14:15', pnl: 38 },
  { time: '14:45', pnl: 45 },
  { time: '15:15', pnl: 52 },
];

const VOLUME_MOCK = [
  { market: 'NSE', buy: 4200, sell: 3800 },
  { market: 'MCX', buy: 2800, sell: 3100 },
  { market: 'Forex', buy: 1500, sell: 1200 },
  { market: 'Crypto', buy: 900, sell: 1100 },
  { market: 'Options', buy: 3500, sell: 3200 },
  { market: 'Futures', buy: 2100, sell: 2400 },
];

/** Mock data for Live M2M (Mark to Market) table */
const M2M_MOCK = [
  { userId: 'USR001', name: 'Rajesh K.', activePnl: 12450, activeTrades: 8, marginUsed: 240000 },
  { userId: 'USR002', name: 'Priya S.', activePnl: -3200, activeTrades: 3, marginUsed: 85000 },
  { userId: 'USR003', name: 'Amit P.', activePnl: 28900, activeTrades: 12, marginUsed: 560000 },
  { userId: 'USR004', name: 'Sneha M.', activePnl: -950, activeTrades: 5, marginUsed: 120000 },
  { userId: 'USR005', name: 'Vikram R.', activePnl: 5100, activeTrades: 7, marginUsed: 320000 },
  { userId: 'USR006', name: 'Anita D.', activePnl: -7800, activeTrades: 4, marginUsed: 180000 },
  { userId: 'USR007', name: 'Kiran L.', activePnl: 41200, activeTrades: 9, marginUsed: 490000 },
  { userId: 'USR008', name: 'Pooja N.', activePnl: 1350, activeTrades: 2, marginUsed: 95000 },
];

const M2M_PAGE_SIZE = 5;

export function DashboardPage() {
  const { stats, isLoading } = useDashboard();
  const s = stats as Record<string, number | undefined>;
  const [m2mPage, setM2mPage] = useState(1);

  const cardClassName = 'bg-sidebar';

  const m2mPaginated = useMemo(() => {
    const start = (m2mPage - 1) * M2M_PAGE_SIZE;
    return M2M_MOCK.slice(start, start + M2M_PAGE_SIZE);
  }, [m2mPage]);

  const m2mTotals = useMemo(() => {
    return m2mPaginated.reduce(
      (acc, row) => ({
        activePnl: acc.activePnl + row.activePnl,
        activeTrades: acc.activeTrades + row.activeTrades,
        marginUsed: acc.marginUsed + row.marginUsed,
      }),
      { activePnl: 0, activeTrades: 0, marginUsed: 0 }
    );
  }, [m2mPaginated]);

  const m2mTotalRows = M2M_MOCK.length;
  const m2mTotalPages = Math.ceil(m2mTotalRows / M2M_PAGE_SIZE);
  const m2mStart = (m2mPage - 1) * M2M_PAGE_SIZE + 1;
  const m2mEnd = Math.min(m2mPage * M2M_PAGE_SIZE, m2mTotalRows);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          className={cardClassName}
          title="Buy Turnover"
          value={isLoading ? '...' : formatCr(s.buyTurnover ?? 0)}
          subtitle={s.buyTurnover != null ? undefined : '+12.5% from yesterday'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          className={cardClassName}
          title="Sell Turnover"
          value={isLoading ? '...' : formatCr(s.sellTurnover ?? 0)}
          subtitle={s.sellTurnover != null ? undefined : '+8.3% from yesterday'}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          className={cardClassName}
          title="Total Turnover"
          value={isLoading ? '...' : formatCr(s.totalTurnover ?? 0)}
          subtitle={s.totalTurnover != null ? undefined : '+10.2% from yesterday'}
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <StatCard
          className={cardClassName}
          title="Active Users"
          value={isLoading ? '...' : String(s.activeUsers ?? '1,247')}
          subtitle="+34 today"
          icon={<Users className="h-5 w-5" />}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          className={cardClassName}
          title="Profit / Loss"
          value={isLoading ? '...' : formatCr(s.profitLoss ?? 0)}
          subtitle={s.profitLoss != null ? undefined : '+₹2.1L from yesterday'}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          className={cardClassName}
          title="Brokerage"
          value={isLoading ? '...' : formatCr(s.brokerage ?? 0)}
          subtitle={s.brokerage != null ? undefined : '+₹18K today'}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          className={cardClassName}
          title="Active Buy"
          value={isLoading ? '...' : String(s.activeBuy ?? '3,412')}
          subtitle="NSE leading"
          icon={<ArrowUp className="h-5 w-5" />}
        />
        <StatCard
          className={cardClassName}
          title="Active Sell"
          value={isLoading ? '...' : String(s.activeSell ?? '2,891')}
          subtitle="MCX leading"
          icon={<ArrowDown className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard className={cardClassName} title="P&L Curve (Intraday profit & loss)" live>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PNL_MOCK} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700/50" />
                <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${v}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent)' }}
                  formatter={(value: number) => [`₹${value}K`, 'P&L']}
                />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard className={cardClassName} title="Market Volume (Buy vs Sell by market)">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_MOCK} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700/50" />
                <XAxis dataKey="market" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent)' }}
                />
                <Legend />
                <Bar dataKey="buy" fill="#22c55e" name="Buy" radius={[2, 2, 0, 0]} />
                <Bar dataKey="sell" fill="#ef4444" name="Sell" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Live M2M Table - real-time mark to market */}
      <div
        className="overflow-hidden rounded-lg"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        <div className="flex flex-row items-start justify-between border-b border-gray-700/40 px-5 pt-5 pb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Live M2M Table
            </h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Real-time mark to market
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            LIVE
          </span>
        </div>
        <div className="overflow-x-auto px-5 pb-5 pt-2">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                  USER ID
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                  NAME
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                  ACTIVE P&L
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                  ACTIVE TRADES
                </th>
                <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                  MARGIN USED
                </th>
              </tr>
            </thead>
            <tbody>
              {m2mPaginated.map((row) => (
                <tr
                  key={row.userId}
                  className="border-b border-gray-700/40 last:border-b-0"
                >
                  <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                    {row.userId}
                  </td>
                  <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                    {row.name}
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium">
                    {row.activePnl >= 0 ? (
                      <span className="text-emerald-400">
                        +₹{row.activePnl.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-red-400">
                        -₹{Math.abs(row.activePnl).toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-sm text-[var(--text-primary)]">
                    {row.activeTrades}
                  </td>
                  <td className="py-3 text-sm text-[var(--text-primary)]">
                    ₹{row.marginUsed.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-600/60 bg-black/10">
                <td
                  colSpan={2}
                  className="py-3 pr-4 text-sm font-semibold text-[var(--text-primary)]"
                >
                  Total
                </td>
                <td className="py-3 pr-4 text-sm font-semibold">
                  {m2mTotals.activePnl >= 0 ? (
                    <span className="text-emerald-400">
                      +₹{m2mTotals.activePnl.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-red-400">
                      -₹{Math.abs(m2mTotals.activePnl).toLocaleString('en-IN')}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-sm font-semibold text-[var(--text-primary)]">
                  {m2mTotals.activeTrades}
                </td>
                <td className="py-3 text-sm font-semibold text-[var(--text-primary)]">
                  ₹{m2mTotals.marginUsed.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-700/40 px-5 py-3">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {m2mStart}–{m2mEnd} of {m2mTotalRows}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setM2mPage((p) => Math.max(1, p - 1))}
              disabled={m2mPage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-600 bg-transparent text-[var(--text-primary)] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[6rem] text-center text-sm text-[var(--text-primary)]">
              Page {m2mPage} of {m2mTotalPages}
            </span>
            <button
              type="button"
              onClick={() => setM2mPage((p) => Math.min(m2mTotalPages, p + 1))}
              disabled={m2mPage >= m2mTotalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-600 bg-transparent text-[var(--text-primary)] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
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
