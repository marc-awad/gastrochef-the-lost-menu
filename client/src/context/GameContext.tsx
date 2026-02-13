import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

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

// ✅ Valeurs initiales NEUTRES — elles seront écrasées par le stats_update
// envoyé par le serveur dès la connexion socket (vraies valeurs BDD)
const initialStats: GameStats = {
  satisfaction: 20,
  treasury: 1000,
  stars: 3,
  servedOrders: 0,
  failedOrders: 0,
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<GameStats>(initialStats);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const timeout = setTimeout(() => {
      const socket = getSocket();
      if (!socket) return;

      // Nettoyer avant de brancher pour éviter les doublons
      socket.off('stats_update');
      socket.off('game_over');

      // ✅ stats_update : source de vérité unique
      // Le premier reçu juste après connexion contient les vraies stats BDD
      socket.on('stats_update', (data: Partial<GameStats>) => {
        setStats((prev) => ({ ...prev, ...data }));
      });

      socket.on(
        'game_over',
        (data: { reason: string; satisfaction: number }) => {
          setStats((prev) => ({ ...prev, satisfaction: data.satisfaction }));
        }
      );
    }, 100);

    return () => {
      clearTimeout(timeout);
      const socket = getSocket();
      if (socket) {
        socket.off('stats_update');
        socket.off('game_over');
      }
    };
  }, [token]);

  const updateStats = (newStats: Partial<GameStats>) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  };

  const incrementServed = () => {
    setStats((prev) => ({ ...prev, servedOrders: prev.servedOrders + 1 }));
  };

  const incrementFailed = () => {
    setStats((prev) => ({ ...prev, failedOrders: prev.failedOrders + 1 }));
  };

  // ✅ resetStats remet le state local ET appelle l'API reset (depuis GameOver.tsx)
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
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
