import { useEffect } from 'react';
import OrderQueue from '../components/OrderQueue';
import { Card } from '../libs/components/ui/card';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { connectSocket } from '../services/socket';
import { useGame } from '../context/GameContext';

export default function Service() {
  const { stats } = useGame();

  // Connecter le socket au montage du composant
  useEffect(() => {
    const socket = connectSocket();

    return () => {
      // Ne pas déconnecter ici pour garder la connexion active
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            🍽️ Service en Direct
          </h1>

          {/* Cartes de statistiques */}
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
                {stats.satisfaction >= 20 ? (
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

        {/* File d'attente des commandes */}
        <OrderQueue />

        {/* Game Over */}
        {stats.satisfaction <= 0 && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="p-12 max-w-md text-center mx-4">
              <h2 className="text-4xl font-bold text-red-600 mb-4">
                GAME OVER
              </h2>
              <p className="text-xl text-gray-700 mb-2">
                Satisfaction client : 0 ⭐
              </p>
              <p className="text-gray-600 mb-6">
                Votre restaurant a fermé ses portes...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Recommencer
              </button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
