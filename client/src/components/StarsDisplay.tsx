import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export const StarsDisplay: React.FC = () => {
  const { stats } = useGame();
  const [animateStars, setAnimateStars] = useState(false);
  const [previousStars, setPreviousStars] = useState(stats.stars);

  // ✨ Animation lors du changement d'étoiles
  useEffect(() => {
    if (stats.stars !== previousStars) {
      setAnimateStars(true);
      setPreviousStars(stats.stars);

      const timeout = setTimeout(() => {
        setAnimateStars(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [stats.stars, previousStars]);

  // Générer les étoiles (pleines + vides)
  const renderStars = () => {
    const stars = [];
    const maxStars = 3;

    for (let i = 0; i < maxStars; i++) {
      const isFilled = i < stats.stars;
      stars.push(
        <span
          key={i}
          className={`
            inline-block transition-all duration-300
            ${animateStars ? 'animate-bounce-star scale-125' : 'scale-100'}
            ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
          `}
          style={{
            fontSize: '1.5rem',
            animationDelay: `${i * 100}ms`,
          }}
        >
          {isFilled ? '⭐' : '☆'}
        </span>
      );
    }

    return stars;
  };

  // Classe de couleur selon le nombre d'étoiles
  const getColorClass = () => {
    if (stats.stars === 3) return 'text-green-600';
    if (stats.stars === 2) return 'text-yellow-600';
    if (stats.stars === 1) return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-white px-4 py-2 rounded-lg border-2 border-yellow-200 shadow-sm">
      <div className="flex items-center gap-1">{renderStars()}</div>
      <span className={`text-sm font-semibold ${getColorClass()}`}>
        {stats.stars}/3
      </span>

      {/* Warning si 1 étoile */}
      {stats.stars === 1 && (
        <span className="text-xs text-red-500 font-medium ml-2 animate-pulse">
          ⚠️ Attention !
        </span>
      )}

      {/* Styles pour l'animation */}
      <style>{`
        @keyframes bounce-star {
          0%, 100% { transform: translateY(0) scale(1.25); }
          50% { transform: translateY(-8px) scale(1.4); }
        }
        .animate-bounce-star {
          animation: bounce-star 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};
