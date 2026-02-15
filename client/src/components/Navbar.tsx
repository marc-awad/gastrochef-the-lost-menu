import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../libs/components/ui/navigation-menu';
import { Badge } from '../libs/components/ui/badge';
import { Button } from '../libs/components/ui/button';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut,
  Beaker,
  BookOpen,
  UtensilsCrossed,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  Package, // ✅ TICKET #021
} from 'lucide-react';

// ─────────────────────────────────────────────
//  Helper : format avec séparateurs de milliers
//  ex: 1250.5 → "1 250,50"
// ─────────────────────────────────────────────
const formatTreasury = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const Navbar = () => {
  const { stats, updateStats } = useGame();
  const { logout } = useAuth();
  const location = useLocation();

  // ── Animation trésorerie ─────────────────────────────────
  const [treasuryAnim, setTreasuryAnim] = useState<'idle' | 'gain' | 'loss'>(
    'idle'
  );
  const prevTreasuryRef = useRef<number>(stats.treasury);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ⭐ TICKET #020 : Animation étoiles
  const [starsAnim, setStarsAnim] = useState(false);
  const prevStarsRef = useRef<number>(stats.stars);
  const starsAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Écoute treasury_updated via WebSocket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTreasuryUpdated = (data: { treasury: number }) => {
      updateStats({ treasury: data.treasury });
    };

    // ⭐ TICKET #020 : Écoute stars_updated
    const handleStarsUpdated = (data: { stars: number }) => {
      updateStats({ stars: data.stars });
    };

    socket.on('treasury_updated', handleTreasuryUpdated);
    socket.on('stars_updated', handleStarsUpdated);

    return () => {
      socket.off('treasury_updated', handleTreasuryUpdated);
      socket.off('stars_updated', handleStarsUpdated);
    };
  }, [updateStats]);

  // Déclenche l'animation quand stats.treasury change
  useEffect(() => {
    const prev = prevTreasuryRef.current;
    const curr = stats.treasury;

    if (prev !== curr) {
      const anim = curr > prev ? 'gain' : 'loss';
      setTreasuryAnim(anim);

      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = setTimeout(() => setTreasuryAnim('idle'), 1200);

      prevTreasuryRef.current = curr;
    }
  }, [stats.treasury]);

  // ⭐ TICKET #020 : Animation étoiles
  useEffect(() => {
    const prev = prevStarsRef.current;
    const curr = stats.stars;

    if (prev !== curr) {
      setStarsAnim(true);

      if (starsAnimTimeoutRef.current)
        clearTimeout(starsAnimTimeoutRef.current);
      starsAnimTimeoutRef.current = setTimeout(() => setStarsAnim(false), 1000);

      prevStarsRef.current = curr;
    }
  }, [stats.stars]);

  // Cleanup timeout au démontage
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (starsAnimTimeoutRef.current)
        clearTimeout(starsAnimTimeoutRef.current);
    };
  }, []);

  // ── Satisfaction helpers ─────────────────────────────────
  const getSatisfactionColor = (s: number): string => {
    if (s >= 15) return 'bg-green-500';
    if (s >= 10) return 'bg-yellow-500';
    if (s >= 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSatisfactionIcon = (s: number) => {
    if (s >= 15) return <TrendingUp className="w-4 h-4" />;
    if (s >= 5) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getSatisfactionLabel = (s: number): string => {
    if (s >= 15) return 'Excellente';
    if (s >= 10) return 'Bonne';
    if (s >= 5) return 'Critique';
    return 'Danger !';
  };

  const isActive = (path: string) => location.pathname === path;

  const displayTreasury = Math.round(stats.treasury * 100) / 100;
  const isLowTreasury = displayTreasury < 200;

  // ── Classes CSS trésorerie selon état ────────────────────
  const getTreasuryClasses = (): string => {
    const base =
      'text-white border-0 px-3 py-1.5 shadow-md transition-all duration-300 ';

    if (treasuryAnim === 'gain') {
      return base + 'bg-emerald-500 scale-105 shadow-emerald-400/50 shadow-lg';
    }
    if (treasuryAnim === 'loss') {
      return base + 'bg-red-500 scale-105 shadow-red-400/50 shadow-lg';
    }
    if (isLowTreasury) {
      return base + 'bg-orange-500 animate-pulse';
    }
    return base + (displayTreasury >= 0 ? 'bg-green-600' : 'bg-red-600');
  };

  // ⭐ TICKET #020 : Helper étoiles
  const getStarsDisplay = () => {
    const maxStars = 3;
    const stars = [];

    for (let i = 0; i < maxStars; i++) {
      const isFilled = i < stats.stars;
      stars.push(
        <span
          key={i}
          className={`
            inline-block transition-all duration-300
            ${starsAnim ? 'animate-bounce-star scale-125' : 'scale-100'}
            ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
          `}
          style={{
            fontSize: '1rem',
            animationDelay: `${i * 100}ms`,
          }}
        >
          {isFilled ? '⭐' : '☆'}
        </span>
      );
    }

    return stars;
  };

  // ⭐ TICKET #020 : Couleur badge étoiles
  const getStarsColor = (): string => {
    if (stats.stars === 3) return 'bg-yellow-500';
    if (stats.stars === 2) return 'bg-yellow-600';
    if (stats.stars === 1) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Nom */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                GastroChef
              </h1>
              <p className="text-xs text-gray-500">The Lost Menu</p>
            </div>
          </div>

          {/* Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/laboratory"
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:outline-none
                      ${isActive('/laboratory') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                  >
                    <Beaker className="w-4 h-4 mr-2" />
                    Laboratoire
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/service"
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:outline-none
                      ${isActive('/service') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                  >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Service
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/recipes"
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:outline-none
                      ${isActive('/recipes') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Recettes
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/marketplace"
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-amber-50 hover:text-amber-700 focus:outline-none
                      ${isActive('/marketplace') ? 'bg-amber-100 text-amber-700' : 'text-gray-700'}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Marché
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/dashboard"
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-blue-50 hover:text-blue-700 focus:outline-none
                      ${isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* ✅ TICKET #021 : Inventaire */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/inventory"
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:outline-none
                      ${isActive('/inventory') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}`}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Inventaire
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Stats + Déconnexion */}
          <div className="flex items-center gap-3">
            {/* Satisfaction */}
            <Badge
              variant="outline"
              className={`${getSatisfactionColor(stats.satisfaction)} text-white border-0 px-3 py-2 shadow-lg transition-all duration-300
                ${stats.satisfaction < 5 ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center gap-2">
                {getSatisfactionIcon(stats.satisfaction)}
                <div className="flex flex-col items-start">
                  <span className="text-xs opacity-90">Satisfaction</span>
                  <span className="text-sm font-bold">
                    {stats.satisfaction} pts
                  </span>
                </div>
              </div>
            </Badge>

            {/* ⭐ TICKET #020 : Étoiles améliorées */}
            <Badge
              variant="outline"
              className={`${getStarsColor()} text-white border-0 px-3 py-2 shadow-lg transition-all duration-300
                ${stats.stars === 1 ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center gap-1">{getStarsDisplay()}</div>
              {stats.stars === 1 && <span className="ml-2 text-xs">⚠️</span>}
            </Badge>

            {/* Trésorerie avec animation + alerte */}
            <Badge variant="outline" className={getTreasuryClasses()}>
              {isLowTreasury && treasuryAnim === 'idle' ? (
                <AlertTriangle className="w-4 h-4 mr-1" />
              ) : (
                <Wallet className="w-4 h-4 mr-1" />
              )}
              <div className="flex flex-col items-start">
                {isLowTreasury && (
                  <span className="text-xs opacity-90 leading-none">
                    Fonds bas !
                  </span>
                )}
                <span className="font-semibold tabular-nums">
                  {formatTreasury(displayTreasury)}€
                </span>
              </div>
            </Badge>

            {/* Déconnexion */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* ── Barre d'alerte satisfaction critique ── */}
        {stats.satisfaction < 10 && (
          <div className="py-2 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center text-sm font-medium animate-pulse">
            ⚠️ Attention : Satisfaction critique ! (
            {getSatisfactionLabel(stats.satisfaction)}) — Servez des commandes
            rapidement !
          </div>
        )}

        {/* ⭐ TICKET #020 : Barre d'alerte étoiles */}
        {stats.stars === 1 && (
          <div className="py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center text-sm font-medium animate-pulse">
            ⚠️ DERNIÈRE ÉTOILE ! Une commande VIP ratée = Game Over !
          </div>
        )}

        {/* ── Barre d'alerte trésorerie basse ── */}
        {isLowTreasury && (
          <div className="py-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center text-sm font-medium">
            💸 Trésorerie faible ({formatTreasury(displayTreasury)}€) — Servez
            des commandes pour renflouer les caisses !
          </div>
        )}
      </div>

      {/* ⭐ Styles pour l'animation bounce-star */}
      <style>{`
        @keyframes bounce-star {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.25); }
        }
        .animate-bounce-star {
          animation: bounce-star 0.6s ease-in-out;
        }
      `}</style>
    </nav>
  );
};
