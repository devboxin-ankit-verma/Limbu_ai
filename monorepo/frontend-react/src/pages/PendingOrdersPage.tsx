import { useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { useOrders } from '../hooks/useOrders';
import type { OrderRow } from '../services/orderService';

export function PendingOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, meta, isLoading } = useOrders({ page, limit: 20, status: 'pending' });

  const columns: Column<OrderRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'userId', header: 'User ID' },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (row) => (row.symbol as { code?: string })?.code ?? row.symbolId,
    },
    { key: 'side', header: 'Side' },
    { key: 'type', header: 'Type' },
    { key: 'quantity', header: 'Qty' },
    { key: 'price', header: 'Price' },
    { key: 'status', header: 'Status' },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending Orders</h2>
      <DataTable<OrderRow>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        emptyMessage="No pending orders."
      />
    </div>
  );
}
