import {
  Clock,
  ChefHat,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../libs/components/ui/card';
import { Button } from '../libs/components/ui/button';
import { useOrders } from '../hooks/useOrders';
import type { OrderWithTimer } from '../types/order';

export default function OrderQueue() {
  const { orders, servingOrderId, serveOrder } = useOrders();

  // Formater le temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Déterminer la couleur selon le temps restant
  const getTimerColor = (seconds: number): string => {
    if (seconds <= 10) return 'text-red-600';
    if (seconds <= 30) return 'text-orange-500';
    return 'text-green-600';
  };

  // Classes CSS pour le style de la carte
  const getCardClasses = (order: OrderWithTimer): string => {
    const baseClasses =
      'transition-all duration-300 border-2 hover:shadow-xl transform hover:-translate-y-1';

    if (order.remainingSeconds <= 10) {
      return `${baseClasses} bg-red-50 border-red-300 shadow-lg shadow-red-200 animate-pulse`;
    }

    if (order.remainingSeconds <= 30) {
      return `${baseClasses} bg-orange-50 border-orange-300 shadow-md shadow-orange-200`;
    }

    return `${baseClasses} bg-white border-gray-200`;
  };

  const getVipClasses = (isVip: boolean): string => {
    if (!isVip) return '';
    return 'ring-4 ring-yellow-400 ring-offset-2 shadow-2xl';
  };

  const handleServe = async (orderId: number) => {
    await serveOrder(orderId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ChefHat className="w-6 h-6 md:w-8 md:h-8" />
          File d'attente
        </h2>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-lg shadow-md">
          <span className="text-sm font-semibold text-white">
            {orders.length} commande{orders.length !== 1 ? 's' : ''} en attente
          </span>
        </div>
      </div>

      {/* Liste vide */}
      {orders.length === 0 ? (
        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Clock className="w-12 h-12 md:w-16 md:h-16 opacity-30" />
            <p className="text-lg md:text-xl font-medium">
              Aucune commande en cours
            </p>
            <p className="text-sm md:text-base">
              Les commandes apparaîtront ici en temps réel
            </p>
          </div>
        </Card>
      ) : (
        // Grille de commandes
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className={`
                p-4 md:p-5 relative
                ${getCardClasses(order)}
                ${getVipClasses(order.is_vip)}
              `}
            >
              {/* Badge VIP */}
              {order.is_vip && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg z-10">
                  <Sparkles className="w-3 h-3" />
                  VIP
                </div>
              )}

              {/* En-tête du ticket */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg md:text-xl text-gray-800 line-clamp-2 pr-2">
                    {order.recipe_name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Commande #{order.id}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <div className="bg-green-100 px-3 py-1 rounded-lg">
                    <p className="text-xl md:text-2xl font-bold text-green-700 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {order.price}€
                    </p>
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="mb-4 p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`w-4 h-4 md:w-5 md:h-5 ${getTimerColor(
                        order.remainingSeconds
                      )} ${order.remainingSeconds <= 10 ? 'animate-pulse' : ''}`}
                    />
                    <span className="text-xs md:text-sm text-gray-600 font-medium">
                      Temps restant
                    </span>
                  </div>
                  <span
                    className={`text-xl md:text-2xl font-mono font-bold ${getTimerColor(
                      order.remainingSeconds
                    )}`}
                  >
                    {formatTime(order.remainingSeconds)}
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      order.remainingSeconds <= 10
                        ? 'bg-red-500'
                        : order.remainingSeconds <= 30
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (order.remainingSeconds / 60) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Alerte temps critique */}
              {order.remainingSeconds <= 10 && (
                <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-100 p-2 rounded-lg animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">URGENT !</span>
                </div>
              )}

              {/* Bouton servir */}
              <Button
                onClick={() => handleServe(order.id)}
                disabled={servingOrderId === order.id}
                className={`
                  w-full py-5 md:py-6 text-base md:text-lg font-semibold transition-all
                  ${
                    servingOrderId === order.id
                      ? 'bg-gray-400 cursor-wait'
                      : order.remainingSeconds <= 10
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                  }
                `}
              >
                {servingOrderId === order.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Service en cours...
                  </span>
                ) : (
                  '🍽️ Servir la commande'
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
