import { useEffect } from 'react';
import { OrderQueue } from '../components/OrderQueue';
import { Card } from '../libs/components/ui/card';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useOrders } from '../hooks/useOrders';
import { toast } from 'sonner';

// ✅ Plus de connectSocket ici — géré globalement dans AuthContext

export default function Service() {
  const { stats } = useGame();
  const { orders, removeOrder } = useOrders();

  const handleOrderServed = (orderId: number) => {
    removeOrder(orderId);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  const handleGameOver = () => {
    console.log('Game Over déclenché depuis OrderQueue');
    // Géré automatiquement par GameOverListener
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            🍽️ Service en Direct
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Satisfaction */}
            <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Satisfaction</p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                    {stats.satisfaction}
                    <Star className="w-6 h-6" />
                  </p>
                </div>
                {stats.satisfaction >= 15 ? (
                  <TrendingUp className="w-12 h-12 opacity-50" />
                ) : (
                  <TrendingDown className="w-12 h-12 opacity-50" />
                )}
              </div>
              {stats.satisfaction < 10 && (
                <p className="text-xs mt-2 bg-white/20 px-2 py-1 rounded">
                  ⚠️ Attention : satisfaction critique !
                </p>
              )}
            </Card>

            {/* Étoiles */}
            <Card className="p-5 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Étoiles</p>
                  <p className="text-3xl font-bold">
                    {stats.stars}
                    <span className="text-2xl ml-1">⭐</span>
                  </p>
                </div>
                <div className="text-4xl opacity-50">🌟</div>
              </div>
            </Card>

            {/* Commandes servies */}
            <Card className="p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Servies</p>
                  <p className="text-3xl font-bold">{stats.servedOrders}</p>
                </div>
                <div className="text-4xl opacity-50">✅</div>
              </div>
            </Card>

            {/* Commandes ratées */}
            <Card className="p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Ratées</p>
                  <p className="text-3xl font-bold">{stats.failedOrders}</p>
                </div>
                <div className="text-4xl opacity-50">❌</div>
              </div>
            </Card>
          </div>
        </div>

        <OrderQueue
          orders={orders}
          onOrderServed={handleOrderServed}
          onError={handleError}
          onGameOver={handleGameOver}
        />
      </div>
    </div>
  );
}
