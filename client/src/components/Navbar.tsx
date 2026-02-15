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
  Package,
  Menu,
  X,
} from 'lucide-react';

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

  // ✅ TICKET #022 : État menu burger mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [treasuryAnim, setTreasuryAnim] = useState<'idle' | 'gain' | 'loss'>(
    'idle'
  );
  const prevTreasuryRef = useRef<number>(stats.treasury);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [starsAnim, setStarsAnim] = useState(false);
  const prevStarsRef = useRef<number>(stats.stars);
  const starsAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // ✅ TICKET #022 : Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTreasuryUpdated = (data: { treasury: number }) => {
      updateStats({ treasury: data.treasury });
    };

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

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (starsAnimTimeoutRef.current)
        clearTimeout(starsAnimTimeoutRef.current);
    };
  }, []);

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

  const getStarsColor = (): string => {
    if (stats.stars === 3) return 'bg-yellow-500';
    if (stats.stars === 2) return 'bg-yellow-600';
    if (stats.stars === 1) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // ✅ TICKET #022 : Navigation items (réutilisés desktop + mobile)
  const navigationLinks = [
    { to: '/laboratory', icon: Beaker, label: 'Laboratoire', color: 'violet' },
    {
      to: '/service',
      icon: UtensilsCrossed,
      label: 'Service',
      color: 'violet',
    },
    { to: '/recipes', icon: BookOpen, label: 'Recettes', color: 'violet' },
    { to: '/marketplace', icon: ShoppingCart, label: 'Marché', color: 'amber' },
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard', color: 'blue' },
    { to: '/inventory', icon: Package, label: 'Inventaire', color: 'violet' },
  ];

  return (
    <>
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
                <p className="text-xs text-gray-500 hidden sm:block">
                  The Lost Menu
                </p>
              </div>
            </div>

            {/* ✅ TICKET #022 : Navigation Desktop uniquement */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  const colorClass =
                    link.color === 'amber'
                      ? 'hover:bg-amber-50 hover:text-amber-700'
                      : link.color === 'blue'
                        ? 'hover:bg-blue-50 hover:text-blue-700'
                        : 'hover:bg-violet-50 hover:text-violet-700';
                  const activeClass =
                    link.color === 'amber'
                      ? 'bg-amber-100 text-amber-700'
                      : link.color === 'blue'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-violet-100 text-violet-700';

                  return (
                    <NavigationMenuItem key={link.to}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.to}
                          className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none
                            ${colorClass}
                            ${isActive(link.to) ? activeClass : 'text-gray-700'}`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Stats + Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* ✅ TICKET #022 : Stats masquées sur très petit écran, compactes sur mobile */}

              {/* Satisfaction - Masqué sur xs */}
              <Badge
                variant="outline"
                className={`${getSatisfactionColor(stats.satisfaction)} text-white border-0 px-2 md:px-3 py-1.5 md:py-2 shadow-lg transition-all duration-300
                  ${stats.satisfaction < 5 ? 'animate-pulse' : ''} hidden sm:flex`}
              >
                <div className="flex items-center gap-1 md:gap-2">
                  {getSatisfactionIcon(stats.satisfaction)}
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-90 hidden md:block">
                      Satisfaction
                    </span>
                    <span className="text-xs md:text-sm font-bold">
                      {stats.satisfaction}
                    </span>
                  </div>
                </div>
              </Badge>

              {/* Étoiles */}
              <Badge
                variant="outline"
                className={`${getStarsColor()} text-white border-0 px-2 md:px-3 py-1.5 md:py-2 shadow-lg transition-all duration-300
                  ${stats.stars === 1 ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-1">
                  {getStarsDisplay()}
                </div>
                {stats.stars === 1 && (
                  <span className="ml-1 md:ml-2 text-xs">⚠️</span>
                )}
              </Badge>

              {/* Trésorerie */}
              <Badge variant="outline" className={getTreasuryClasses()}>
                {isLowTreasury && treasuryAnim === 'idle' ? (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                ) : (
                  <Wallet className="w-4 h-4 mr-1" />
                )}
                <span className="font-semibold tabular-nums text-xs md:text-sm">
                  {formatTreasury(displayTreasury)}€
                </span>
              </Badge>

              {/* Déconnexion - Desktop uniquement */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-700 hover:text-red-600 hover:bg-red-50 hidden lg:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Déconnexion</span>
              </Button>

              {/* ✅ TICKET #022 : Burger menu mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Barres d'alerte */}
          {stats.satisfaction < 10 && (
            <div className="py-2 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center text-xs md:text-sm font-medium animate-pulse">
              ⚠️ Satisfaction critique ! (
              {getSatisfactionLabel(stats.satisfaction)})
            </div>
          )}

          {stats.stars === 1 && (
            <div className="py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center text-xs md:text-sm font-medium animate-pulse">
              ⚠️ DERNIÈRE ÉTOILE ! Une commande VIP ratée = Game Over !
            </div>
          )}

          {isLowTreasury && (
            <div className="py-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center text-xs md:text-sm font-medium">
              💸 Trésorerie faible ({formatTreasury(displayTreasury)}€)
            </div>
          )}
        </div>
      </nav>

      {/* ✅ TICKET #022 : Menu mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-2xl animate-slideDown">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${
                          isActive(link.to)
                            ? 'bg-violet-100 text-violet-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                {/* Satisfaction dans le menu mobile */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-gray-600">Satisfaction</span>
                    <span className="font-bold text-gray-800">
                      {stats.satisfaction} pts
                    </span>
                  </div>
                </div>

                {/* Déconnexion dans le menu mobile */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-star {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.25); }
        }
        .animate-bounce-star {
          animation: bounce-star 0.6s ease-in-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
