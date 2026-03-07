import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

interface ChartCardProps {
  title: string;
  live?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, live, children, className }: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {live && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
