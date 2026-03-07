import { useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { usePositions } from '../hooks/usePositions';
import type { PositionRow } from '../services/positionService';

export function ClosePositionsPage() {
  const [page, setPage] = useState(1);
  const { data, meta, isLoading } = usePositions({ page, limit: 20, status: 'closed' });

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
    {
      key: 'openedAt',
      header: 'Opened',
      render: (row) => new Date(row.openedAt).toLocaleString(),
    },
    {
      key: 'closedAt',
      header: 'Closed',
      render: (row) => (row.closedAt ? new Date(row.closedAt).toLocaleString() : '-'),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Closed Positions</h2>
      <DataTable<PositionRow>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        emptyMessage="No closed positions."
      />
    </div>
  );
}
