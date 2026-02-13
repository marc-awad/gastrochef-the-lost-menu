import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '../libs/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../libs/components/ui/card';
import { Badge } from '../libs/components/ui/badge';
import {
  TrendingDown,
  Home,
  RotateCcw,
  Trophy,
  XCircle,
  CheckCircle,
  Wallet,
} from 'lucide-react';

export default function GameOver() {
  const { stats, resetStats } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    // Forcer le scroll en haut
    window.scrollTo(0, 0);
  }, []);

  /**
   * 🔄 Recommencer une nouvelle partie
   */
  const handleRestart = () => {
    resetStats();
    navigate('/laboratory');
  };

  /**
   * 🏠 Retour au menu principal
   */
  const handleBackToMenu = () => {
    navigate('/');
  };

  /**
   * 📊 Calculer le score total
   */
  const calculateScore = () => {
    const servedPoints = stats.servedOrders * 100;
    const failedPenalty = stats.failedOrders * 50;
    const treasuryBonus = stats.treasury > 0 ? stats.treasury : 0;
    return Math.max(0, servedPoints - failedPenalty + treasuryBonus);
  };

  /**
   * 🏆 Déterminer le rang selon le score
   */
  const getRank = (
    score: number
  ): { label: string; emoji: string; color: string } => {
    if (score >= 5000)
      return {
        label: 'Chef Étoilé',
        emoji: '⭐⭐⭐',
        color: 'text-yellow-500',
      };
    if (score >= 3000)
      return { label: 'Restaurateur', emoji: '🍽️', color: 'text-blue-500' };
    if (score >= 1500)
      return { label: 'Chef de Partie', emoji: '👨‍🍳', color: 'text-green-500' };
    if (score >= 500)
      return { label: 'Cuisinier', emoji: '🔪', color: 'text-orange-500' };
    return { label: 'Apprenti', emoji: '👶', color: 'text-gray-500' };
  };

  const totalScore = calculateScore();
  const rank = getRank(totalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* En-tête Game Over */}
        <div className="text-center space-y-4">
          <div className="inline-block p-6 bg-red-600 rounded-full shadow-2xl animate-pulse">
            <TrendingDown className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-red-600 drop-shadow-lg">
            GAME OVER
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Votre restaurant a fermé ses portes...
          </p>
        </div>

        {/* Raison du Game Over */}
        <Card className="border-red-300 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <XCircle className="w-6 h-6" />
              Raison de la fermeture
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-lg">
              <span className="text-gray-700">Satisfaction client :</span>
              <Badge variant="destructive" className="text-xl px-4 py-2">
                {stats.satisfaction} / 20 points
              </Badge>
            </div>
            <p className="text-center text-gray-600 mt-4">
              Votre restaurant a perdu la confiance de ses clients. La
              satisfaction est descendue en dessous de 0.
            </p>
          </CardContent>
        </Card>

        {/* Statistiques de la Partie */}
        <Card className="bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6" />
              Statistiques de la partie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Commandes Servies */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Commandes Servies</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.servedOrders}
                  </p>
                </div>
              </div>

              {/* Commandes Ratées */}
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <XCircle className="w-10 h-10 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Commandes Ratées</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failedOrders}
                  </p>
                </div>
              </div>

              {/* Trésorerie Finale */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <Wallet className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Trésorerie</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.treasury}€
                  </p>
                </div>
              </div>

              {/* Étoiles */}
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <Trophy className="w-10 h-10 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Étoiles Finales</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.stars} ⭐
                  </p>
                </div>
              </div>

              {/* Taux de Réussite */}
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <CheckCircle className="w-10 h-10 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Taux de Réussite</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.servedOrders + stats.failedOrders > 0
                      ? Math.round(
                          (stats.servedOrders /
                            (stats.servedOrders + stats.failedOrders)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {/* Score Total */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg border-2 border-purple-300">
                <Trophy className="w-10 h-10 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Score Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalScore.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Rang Final */}
            <div className="mt-6 p-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg text-center">
              <p className="text-white text-sm mb-2">Rang Final</p>
              <p className={`text-4xl font-bold ${rank.color} drop-shadow-lg`}>
                {rank.emoji} {rank.label}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleRestart}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Recommencer une partie
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleBackToMenu}
            className="border-2 border-gray-300 hover:bg-gray-100"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour au menu
          </Button>
        </div>

        {/* Message encourageant */}
        <div className="text-center">
          <p className="text-gray-600 italic">
            "La cuisine est un art qui s'apprend avec la pratique. Réessayez et
            dépassez-vous !"
          </p>
        </div>
      </div>
    </div>
  );
}
