import { useState } from 'react';
import { DataTable, type Column } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNotices } from '../hooks/useNotices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeService } from '../services/noticeService';
import type { NoticeRow } from '../services/noticeService';

export function NoticePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { data, meta, isLoading } = useNotices({ page, limit: 20 });
  const createMutation = useMutation({
    mutationFn: (payload: { title: string; body: string }) => noticeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setTitle('');
      setBody('');
    },
  });

  const columns: Column<NoticeRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    { key: 'body', header: 'Body', render: (row) => (row.body?.slice(0, 60) ?? '') + (row.body?.length > 60 ? '...' : '') },
    { key: 'type', header: 'Type' },
    { key: 'target', header: 'Target' },
    { key: 'isActive', header: 'Active', render: (row) => (row.isActive ? 'Yes' : 'No') },
    { key: 'publishedAt', header: 'Published', render: (row) => row.publishedAt ? new Date(row.publishedAt).toLocaleString() : '-' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notice</h2>
      <div className="flex flex-col gap-4 rounded-lg border border-gray-700/50 bg-[var(--bg-card)] p-4">
        <h3 className="text-sm font-medium">Create notice</h3>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="max-w-md"
          />
          <Button
            onClick={() => title && body && createMutation.mutate({ title, body })}
            disabled={!title || !body || createMutation.isPending}
          >
            Create
          </Button>
        </div>
      </div>
      <DataTable<NoticeRow>
        columns={columns}
        data={data}
        loading={isLoading}
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={setPage}
        emptyMessage="No notices."
      />
    </div>
  );
}
