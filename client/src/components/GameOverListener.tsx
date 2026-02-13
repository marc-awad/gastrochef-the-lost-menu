import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import { toast } from 'sonner';

// ✅ GameOverListener n'observe plus stats.satisfaction directement
// pour éviter les redirections en boucle causées par les mises à jour de stats
// La seule source de game_over est l'événement WebSocket du serveur

export const GameOverListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGameOver = (data: { reason: string; satisfaction: number }) => {
      console.log('💀 Game Over détecté via WebSocket - Redirection...', data);

      toast.error('GAME OVER - Satisfaction trop basse !', {
        duration: 3000,
        description: `Votre restaurant a fermé ses portes (${data.satisfaction} pts)`,
      });

      setTimeout(() => {
        navigate('/game-over', { replace: true });
      }, 2000);
    };

    socket.off('game_over');
    socket.on('game_over', handleGameOver);

    return () => {
      socket.off('game_over', handleGameOver);
    };
  }, [navigate]);

  return null;
};
