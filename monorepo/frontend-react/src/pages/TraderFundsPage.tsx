import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { useUsersList } from '../hooks/useUsersList';
import { useWallets } from '../hooks/useWallets';
import { Button } from '../components/ui/button';

export function TraderFundsPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { data: users } = useUsersList({ page: 1, limit: 100 });
  const { data: wallets, isLoading } = useWallets(selectedUserId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Trader Funds</h2>
      <Card>
        <CardHeader>
          <p className="text-sm text-[var(--text-muted)]">Select a trading client to view wallet balances.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {(users ?? []).slice(0, 50).map((u) => (
              <Button
                key={u.id}
                variant={selectedUserId === u.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedUserId(u.id)}
              >
                {u.username} ({u.id})
              </Button>
            ))}
          </div>
        </CardHeader>
        {selectedUserId && (
          <CardContent>
            {isLoading ? (
              <p className="text-[var(--text-muted)]">Loading wallets...</p>
            ) : wallets.length === 0 ? (
              <p className="text-[var(--text-muted)]">No wallets found for this user.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Currency</th>
                    <th className="px-4 py-2 text-left">Balance</th>
                    <th className="px-4 py-2 text-left">Locked</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((w) => (
                    <tr key={w.id} className="border-b border-gray-700/30">
                      <td className="px-4 py-2">{w.id}</td>
                      <td className="px-4 py-2">{w.currency}</td>
                      <td className="px-4 py-2">{String(w.balance)}</td>
                      <td className="px-4 py-2">{String(w.lockedBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
