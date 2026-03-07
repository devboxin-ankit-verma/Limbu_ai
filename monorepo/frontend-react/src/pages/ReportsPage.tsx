import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(formatDate(new Date()));
  const [dateTo, setDateTo] = useState(formatDate(new Date()));
  const [userId, setUserId] = useState('');

  const turnoverQuery = useQuery({
    queryKey: ['reports', 'turnover', dateFrom, dateTo, userId || undefined],
    queryFn: () =>
      reportService.getTurnover({
        dateFrom,
        dateTo,
        userId: userId ? parseInt(userId, 10) : undefined,
      }),
  });
  const pnlQuery = useQuery({
    queryKey: ['reports', 'pnl', dateFrom, dateTo, userId || undefined],
    queryFn: () =>
      reportService.getProfitLoss({
        dateFrom,
        dateTo,
        userId: userId ? parseInt(userId, 10) : undefined,
      }),
  });
  const brokerageQuery = useQuery({
    queryKey: ['reports', 'brokerage', dateFrom, dateTo, userId || undefined],
    queryFn: () =>
      reportService.getBrokerage({
        dateFrom,
        dateTo,
        userId: userId ? parseInt(userId, 10) : undefined,
      }),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reports</h2>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">User ID (optional)</label>
              <Input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="All users"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Turnover</h3>
            {turnoverQuery.isLoading ? (
              <p className="text-sm">Loading...</p>
            ) : Array.isArray(turnoverQuery.data) && turnoverQuery.data.length > 0 ? (
              <pre className="mt-1 overflow-auto rounded bg-black/20 p-2 text-xs">
                {JSON.stringify(turnoverQuery.data, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No turnover data.</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Profit & Loss</h3>
            {pnlQuery.isLoading ? (
              <p className="text-sm">Loading...</p>
            ) : Array.isArray(pnlQuery.data) && pnlQuery.data.length > 0 ? (
              <pre className="mt-1 overflow-auto rounded bg-black/20 p-2 text-xs">
                {JSON.stringify(pnlQuery.data, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No P&L data.</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Brokerage</h3>
            {brokerageQuery.isLoading ? (
              <p className="text-sm">Loading...</p>
            ) : brokerageQuery.data && typeof brokerageQuery.data === 'object' ? (
              <pre className="mt-1 overflow-auto rounded bg-black/20 p-2 text-xs">
                {JSON.stringify(brokerageQuery.data, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No brokerage data.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
