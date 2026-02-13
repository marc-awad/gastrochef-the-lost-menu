import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../libs/components/ui/navigation-menu';
import { Badge } from '../libs/components/ui/badge';
import { Button } from '../libs/components/ui/button';
import {
  Star,
  Wallet,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut,
  Beaker,
  BookOpen,
  UtensilsCrossed,
} from 'lucide-react';

export const Navbar = () => {
  const { stats } = useGame();
  const { logout } = useAuth();
  const location = useLocation();

  const getSatisfactionColor = (satisfaction: number): string => {
    if (satisfaction >= 15) return 'bg-green-500';
    if (satisfaction >= 10) return 'bg-yellow-500';
    if (satisfaction >= 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSatisfactionIcon = (satisfaction: number) => {
    if (satisfaction >= 15) return <TrendingUp className="w-4 h-4" />;
    if (satisfaction >= 5) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getSatisfactionLabel = (satisfaction: number): string => {
    if (satisfaction >= 15) return 'Excellente';
    if (satisfaction >= 10) return 'Bonne';
    if (satisfaction >= 5) return 'Critique';
    return 'Danger !';
  };

  const isActive = (path: string) => location.pathname === path;

  // ✅ Arrondi à 2 décimales pour éviter les 1004.4999999 etc.
  const displayTreasury = Math.round(stats.treasury * 100) / 100;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Nom du Restaurant */}
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

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/laboratory"
                    className={`
                      group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:bg-violet-50 focus:text-violet-700 focus:outline-none
                      ${isActive('/laboratory') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}
                    `}
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
                    className={`
                      group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:bg-violet-50 focus:text-violet-700 focus:outline-none
                      ${isActive('/service') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}
                    `}
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
                    className={`
                      group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                      hover:bg-violet-50 hover:text-violet-700 focus:bg-violet-50 focus:text-violet-700 focus:outline-none
                      ${isActive('/recipes') ? 'bg-violet-100 text-violet-700' : 'text-gray-700'}
                    `}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Recettes
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
              className={`
                ${getSatisfactionColor(stats.satisfaction)} 
                text-white border-0 px-3 py-2 shadow-lg transition-all duration-300
                ${stats.satisfaction < 5 ? 'animate-pulse' : ''}
              `}
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

            {/* Étoiles */}
            <Badge
              variant="outline"
              className="bg-yellow-500 text-white border-0 px-3 py-1.5 shadow-md"
            >
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span className="font-semibold">{stats.stars}</span>
            </Badge>

            {/* ✅ Trésorerie — arrondie, toujours affichée */}
            <Badge
              variant="outline"
              className={`
                ${displayTreasury > 0 ? 'bg-green-600' : 'bg-red-600'} 
                text-white border-0 px-3 py-1.5 shadow-md
              `}
            >
              <Wallet className="w-4 h-4 mr-1" />
              <span className="font-semibold">{displayTreasury}€</span>
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

        {/* Barre d'alerte si satisfaction critique */}
        {stats.satisfaction < 10 && (
          <div className="py-2 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center text-sm font-medium animate-pulse">
            ⚠️ Attention : Satisfaction critique ! (
            {getSatisfactionLabel(stats.satisfaction)}) - Servez des commandes
            rapidement !
          </div>
        )}
      </div>
    </nav>
  );
};
