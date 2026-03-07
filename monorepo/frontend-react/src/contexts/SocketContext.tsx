import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { config } from '../config';
import { useAuthStore } from '../stores/authStore';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }
    const s = io(config.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('trade:executed', () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
    s.on('position:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
    s.on('dashboard:metrics', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
    s.on('market:quote', () => {
      queryClient.invalidateQueries({ queryKey: ['marketWatch'] });
    });
    setSocket(s);
    return () => {
      s.off('trade:executed');
      s.off('position:updated');
      s.off('dashboard:metrics');
      s.off('market:quote');
      s.close();
      setSocket(null);
      setConnected(false);
    };
  }, [token, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue | null {
  return useContext(SocketContext);
}
