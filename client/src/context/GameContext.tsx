import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getSocket } from '../services/socket';

type GameStats = {
  satisfaction: number;
  treasury: number;
  stars: number;
  servedOrders: number;
  failedOrders: number;
};

type GameContextType = {
  stats: GameStats;
  updateStats: (newStats: Partial<GameStats>) => void;
  incrementServed: () => void;
  incrementFailed: () => void;
  resetStats: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialStats: GameStats = {
  satisfaction: 20,
  treasury: 1000,
  stars: 3,
  servedOrders: 0,
  failedOrders: 0,
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<GameStats>(initialStats);

  // Écouter les mises à jour de stats via WebSocket
  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      // Mise à jour générale des stats
      socket.on('stats_update', (data: Partial<GameStats>) => {
        setStats((prev) => ({ ...prev, ...data }));
      });

      // Événement quand une commande expire
      socket.on('order_expired', (data: any) => {
        setStats((prev) => ({
          ...prev,
          satisfaction: Math.max(0, prev.satisfaction - 10),
          failedOrders: prev.failedOrders + 1,
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('stats_update');
        socket.off('order_expired');
      }
    };
  }, []);

  const updateStats = (newStats: Partial<GameStats>) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  };

  const incrementServed = () => {
    setStats((prev) => ({ ...prev, servedOrders: prev.servedOrders + 1 }));
  };

  const incrementFailed = () => {
    setStats((prev) => ({
      ...prev,
      failedOrders: prev.failedOrders + 1,
      satisfaction: Math.max(0, prev.satisfaction - 10),
    }));
  };

  const resetStats = () => {
    setStats(initialStats);
  };

  return (
    <GameContext.Provider
      value={{
        stats,
        updateStats,
        incrementServed,
        incrementFailed,
        resetStats,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
