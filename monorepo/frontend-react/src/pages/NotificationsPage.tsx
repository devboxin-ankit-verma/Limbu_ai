import { useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationRow } from '../services/notificationService';

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, meta, isLoading } = useNotifications({ page, limit: 20 });

  const columns: Column<NotificationRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'userId', header: 'User ID' },
    { key: 'title', header: 'Title' },
    { key: 'body', header: 'Body', render: (row) => (row.body?.slice(0, 50) ?? '') + (row.body?.length > 50 ? '...' : '') },
    { key: 'read', header: 'Read', render: (row) => (row.read ? 'Yes' : 'No') },
    { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notifications</h2>
      <DataTable<NotificationRow>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        emptyMessage="No notifications."
      />
    </div>
  );
}
