import React, { useState, useEffect } from 'react';
import { serveOrder } from '../services/api';
import { useGame } from '../context/GameContext';
import { toast } from 'sonner';

interface Order {
  id: number;
  recipe_id: number;
  recipe_name: string;
  price: number;
  expires_at: string;
  is_vip: boolean;
  created_at?: string;
}

interface OrderQueueProps {
  orders: Order[];
  onOrderServed: (orderId: number) => void;
  onError: (message: string) => void;
  onGameOver?: () => void;
}

export const OrderQueue: React.FC<OrderQueueProps> = ({
  orders,
  onOrderServed,
  onError,
  onGameOver,
}) => {
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [timers, setTimers] = useState<Record<number, number>>({});
  const { updateStats, incrementServed } = useGame();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimers: Record<number, number> = {};

      orders.forEach((order) => {
        const expiresAt = new Date(order.expires_at).getTime();
        const remainingSeconds = Math.max(
          0,
          Math.floor((expiresAt - now) / 1000)
        );
        newTimers[order.id] = remainingSeconds;
      });

      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleServeOrder = async (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setLoadingOrderId(orderId);

    try {
      const response = await serveOrder(orderId);

      if (response.success) {
        if (response.data?.satisfaction !== undefined) {
          updateStats({ satisfaction: response.data.satisfaction });
        }

        incrementServed();

        toast.success(response.message, {
          icon: order.is_vip ? '⭐' : '✅',
          duration: order.is_vip ? 4000 : 3000,
          description: `${order.recipe_name} - ${order.price.toFixed(2)}€${order.is_vip ? ' (BONUS ×3)' : ''}`,
          className: order.is_vip ? 'bg-yellow-50 border-yellow-400' : '',
        });

        onOrderServed(orderId);

        if (response.data?.gameOver) {
          setTimeout(() => {
            if (onGameOver) {
              onGameOver();
            }
          }, 2000);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Erreur lors du service de la commande';
      onError(errorMessage);

      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });

      if (error.gameOver && onGameOver) {
        setTimeout(() => {
          onGameOver();
        }, 2000);
      }

      if (error.satisfaction !== undefined) {
        updateStats({ satisfaction: error.satisfaction });
      }
    } finally {
      setLoadingOrderId(null);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerClass = (seconds: number): string => {
    if (seconds <= 0) return 'text-red-600 font-bold';
    if (seconds <= 30) return 'text-orange-500 font-semibold';
    if (seconds <= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="order-queue space-y-3 md:space-y-4">
      {/* ✅ TICKET #022 : Header responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h2 className="text-xl md:text-2xl font-bold">📋 File d'attente</h2>
        <span className="text-sm text-gray-500">
          {orders.length} commande{orders.length > 1 ? 's' : ''}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-base md:text-lg">
            Aucune commande en attente
          </p>
          <p className="text-gray-400 text-xs md:text-sm mt-2">
            Les commandes apparaîtront ici en temps réel
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const remainingSeconds = timers[order.id] || 0;
            const isExpired = remainingSeconds <= 0;
            const isLoading = loadingOrderId === order.id;
            const isUrgent = remainingSeconds <= 30 && remainingSeconds > 0;
            const isAnyLoading = loadingOrderId !== null;

            return (
              <div
                key={order.id}
                className={`
                  relative overflow-hidden rounded-lg md:rounded-xl transition-all duration-300
                  ${
                    isExpired
                      ? 'border-2 border-red-500 bg-red-50 shadow-lg'
                      : isUrgent
                        ? 'border-2 border-orange-400 bg-orange-50 shadow-md'
                        : 'border-2 border-gray-300 bg-white shadow-sm'
                  }
                  ${
                    order.is_vip
                      ? 'border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 shadow-xl ring-4 ring-yellow-200'
                      : ''
                  }
                  ${isAnyLoading && !isLoading ? 'opacity-60' : ''}
                  ${order.is_vip && !isExpired ? 'animate-pulse-slow' : ''}
                `}
              >
                {/* VIP Badge */}
                {order.is_vip && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 md:px-3 py-1 rounded-full font-bold text-xs shadow-lg animate-bounce-slow">
                      <span className="text-sm md:text-base">⭐</span>
                      <span>VIP</span>
                    </div>
                  </div>
                )}

                {/* Effet brillance VIP */}
                {order.is_vip && !isExpired && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-20 animate-shimmer"></div>
                )}

                {/* ✅ TICKET #022 : Contenu responsive */}
                <div className="p-3 md:p-4 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    {/* Infos commande */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold text-base md:text-lg truncate ${order.is_vip ? 'text-yellow-900' : ''}`}
                        >
                          {order.recipe_name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                        <p
                          className={`font-semibold ${order.is_vip ? 'text-yellow-700' : 'text-gray-600'}`}
                        >
                          💰 {order.price.toFixed(2)}€
                          {order.is_vip && (
                            <span className="ml-1 text-xs text-yellow-600 hidden sm:inline">
                              (×3 = {(order.price * 3).toFixed(2)}€)
                            </span>
                          )}
                        </p>

                        <p
                          className={`font-mono ${getTimerClass(remainingSeconds)}`}
                        >
                          ⏱️ {formatTime(remainingSeconds)}
                          {isExpired && ' - EXPIRÉ'}
                        </p>
                      </div>

                      {/* Info VIP - Masquée sur très petit écran */}
                      {order.is_vip && !isExpired && (
                        <div className="mt-2 text-xs text-yellow-700 font-medium hidden sm:block">
                          ✨ +5 satisfaction | ×3 argent | -1 ⭐ si raté
                        </div>
                      )}
                    </div>

                    {/* ✅ TICKET #022 : Bouton tactile optimisé (48px minimum) */}
                    <button
                      onClick={() => handleServeOrder(order.id)}
                      disabled={isAnyLoading}
                      className={`
                        px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-200 relative
                        min-h-[48px] w-full sm:w-auto
                        ${
                          isAnyLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isExpired
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : order.is_vip
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }
                      `}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span className="hidden sm:inline">Service...</span>
                        </span>
                      ) : (
                        <>{order.is_vip ? '⭐ ' : ''}🍽️ Servir</>
                      )}
                    </button>
                  </div>

                  {/* Barre de progression */}
                  {!isExpired && (
                    <div
                      className={`mt-3 h-2 bg-gray-200 rounded-full overflow-hidden ${order.is_vip ? 'bg-yellow-100' : ''}`}
                    >
                      <div
                        className={`h-full transition-all duration-1000 ${
                          order.is_vip
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            : remainingSeconds <= 30
                              ? 'bg-red-500'
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.max(0, (remainingSeconds / 120) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};
