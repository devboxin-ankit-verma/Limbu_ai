import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/walletService';

export function PayInOutPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');

  const depositMutation = useMutation({
    mutationFn: (body: { userId: number; amount: number }) => walletService.deposit(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  });
  const withdrawMutation = useMutation({
    mutationFn: (body: { userId: number; amount: number }) => walletService.withdraw(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = parseInt(userId, 10);
    const amt = parseFloat(amount);
    if (isNaN(uid) || isNaN(amt) || amt <= 0) return;
    if (action === 'deposit') depositMutation.mutate({ userId: uid, amount: amt });
    else withdrawMutation.mutate({ userId: uid, amount: amt });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pay In / Pay Out</h2>
      <Card className="max-w-md">
        <CardHeader>
          <p className="text-sm text-[var(--text-muted)]">Deposit or withdraw funds for a user.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">User ID</label>
              <Input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={action === 'deposit' ? 'default' : 'outline'}
                onClick={() => setAction('deposit')}
              >
                Pay In
              </Button>
              <Button
                type="button"
                variant={action === 'withdraw' ? 'default' : 'outline'}
                onClick={() => setAction('withdraw')}
              >
                Pay Out
              </Button>
            </div>
            <Button
              type="submit"
              disabled={depositMutation.isPending || withdrawMutation.isPending}
            >
              {action === 'deposit' ? 'Deposit' : 'Withdraw'}
            </Button>
          </form>
          {(depositMutation.isError || withdrawMutation.isError) && (
            <p className="mt-2 text-sm text-red-500">
              {String(depositMutation.error ?? withdrawMutation.error)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
