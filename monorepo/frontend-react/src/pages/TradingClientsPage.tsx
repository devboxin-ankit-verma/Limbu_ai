import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, type Column } from '../components/DataTable';
import { useUsersList } from '../hooks/useUsersList';
import type { User } from '../types/User';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/ui/button';

export function TradingClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, meta, isLoading } = useUsersList({
    page,
    limit: 20,
    q: search || undefined,
    sort: sortKey,
    order: sortOrder,
  });

  const columns: Column<User>[] = [
    { key: 'id', header: 'ID', sortKey: 'id' },
    { key: 'username', header: 'Username', sortKey: 'username' },
    { key: 'email', header: 'Email', sortKey: 'email' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <span className={row.isActive ? 'text-emerald-500' : 'text-red-500'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'role', header: 'Role' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Link to={ROUTES.TRADING_CLIENT_DETAIL(String(row.id))}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Trading Clients</h2>
      <DataTable<User>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        onSort={(key, order) => {
          setSortKey(key);
          setSortOrder(order);
        }}
        sortKey={sortKey}
        sortOrder={sortOrder}
        searchPlaceholder="Search by email or username..."
        searchValue={search}
        onSearchChange={setSearch}
        emptyMessage="No traders found."
      />
    </div>
  );
}
