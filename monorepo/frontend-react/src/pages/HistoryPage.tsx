import { useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { useTrades } from '../hooks/useTrades';
import type { TradeRow } from '../services/tradeService';

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, meta, isLoading } = useTrades({ page, limit: 20 });

  const columns: Column<TradeRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'orderId', header: 'Order ID' },
    { key: 'userId', header: 'User ID' },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (row) => (row.symbol as { code?: string })?.code ?? row.symbolId,
    },
    { key: 'side', header: 'Side' },
    { key: 'quantity', header: 'Qty' },
    { key: 'price', header: 'Price' },
    { key: 'brokerage', header: 'Brokerage' },
    {
      key: 'executedAt',
      header: 'Time',
      render: (row) => new Date(row.executedAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">History</h2>
      <DataTable<TradeRow>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        emptyMessage="No trade history."
      />
    </div>
  );
}
