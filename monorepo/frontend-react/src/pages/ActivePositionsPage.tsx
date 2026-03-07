import { useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { usePositions } from '../hooks/usePositions';
import type { PositionRow } from '../services/positionService';

export function ActivePositionsPage() {
  const [page, setPage] = useState(1);
  const { data, meta, isLoading } = usePositions({ page, limit: 20, status: 'open' });

  const columns: Column<PositionRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'userId', header: 'User ID' },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (row) => (row.symbol as { code?: string })?.code ?? row.symbolId,
    },
    { key: 'side', header: 'Side' },
    { key: 'quantity', header: 'Qty' },
    { key: 'avgPrice', header: 'Avg Price' },
    { key: 'currentPrice', header: 'Current Price' },
    {
      key: 'openedAt',
      header: 'Opened',
      render: (row) => new Date(row.openedAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Active Positions</h2>
      <DataTable<PositionRow>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        emptyMessage="No open positions."
      />
    </div>
  );
}
