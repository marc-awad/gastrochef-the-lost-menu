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

    const socket = getSocket();
    if (!socket) return;

    // ✅ BUG #005 FIX : Définir les handlers de manière stable
    // (pas de nouvelle fonction à chaque render)
    const handleStatsUpdate = (data: Partial<GameStats>) => {
      console.log('📊 [GameContext] stats_update reçu:', data);
      setStats((prev) => ({ ...prev, ...data }));
    };

    const handleStarsUpdated = (data: { stars: number }) => {
      console.log('⭐ [GameContext] stars_updated reçu:', data);
      setStats((prev) => ({ ...prev, stars: data.stars }));
    };

    const handleOrderExpired = (data: { orderId: number }) => {
      console.log('⏰ [GameContext] order_expired reçu:', data);
      setStats((prev) => ({ ...prev, failedOrders: prev.failedOrders + 1 }));
    };

    const handleGameOver = (data: {
      reason: string;
      satisfaction?: number;
      treasury?: number;
      stars?: number;
    }) => {
      console.log('💀 [GameContext] game_over reçu:', data);
      setStats((prev) => ({
        ...prev,
        ...(data.satisfaction !== undefined && {
          satisfaction: data.satisfaction,
        }),
        ...(data.treasury !== undefined && { treasury: data.treasury }),
        ...(data.stars !== undefined && { stars: data.stars }),
      }));
    };

    // ✅ BUG #005 FIX : Nettoyer AVANT de brancher
    // (pour éviter l'accumulation de listeners si le composant remount)
    socket.off('stats_update', handleStatsUpdate);
    socket.off('stars_updated', handleStarsUpdated);
    socket.off('order_expired', handleOrderExpired);
    socket.off('game_over', handleGameOver);

    // ✅ Brancher les listeners avec les références stables
    socket.on('stats_update', handleStatsUpdate);
    socket.on('stars_updated', handleStarsUpdated);
    socket.on('order_expired', handleOrderExpired);
    socket.on('game_over', handleGameOver);

    console.log('✅ [GameContext] Listeners WebSocket branchés');

    // ✅ BUG #005 FIX : Cleanup au unmount
    return () => {
      console.log('🧹 [GameContext] Nettoyage des listeners');
      socket.off('stats_update', handleStatsUpdate);
      socket.off('stars_updated', handleStarsUpdated);
      socket.off('order_expired', handleOrderExpired);
      socket.off('game_over', handleGameOver);
    };
  }, [token]); // ✅ Dépendance unique et stable

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
    console.log('🔄 [GameContext] Reset des stats');
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
