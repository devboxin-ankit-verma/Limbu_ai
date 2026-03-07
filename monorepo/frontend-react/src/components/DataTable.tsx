import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortKey?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  loading,
  page = 1,
  limit = 20,
  total = 0,
  onPageChange,
  onSort,
  sortKey,
  sortOrder,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return (
    <Card>
      {(onSearchChange || searchValue !== undefined) && (
        <CardHeader className="pb-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 bg-white/5">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-medium text-[var(--text-muted)]"
                  >
                    {col.sortKey && onSort ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSort(col.sortKey!, sortKey === col.sortKey && sortOrder === 'asc' ? 'desc' : 'asc')
                        }
                        className="flex items-center gap-1 hover:text-[var(--accent)]"
                      >
                        {col.header}
                        {sortKey === col.sortKey && (
                          <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-700/30 hover:bg-white/5">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-[var(--text-primary)]">
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between border-t border-gray-700/50 px-4 py-2">
            <span className="text-xs text-[var(--text-muted)]">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
