import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {title}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-emerald-500">{subtitle}</p>
            )}
          </div>
          {icon && <div className="text-[var(--accent)] opacity-80">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
