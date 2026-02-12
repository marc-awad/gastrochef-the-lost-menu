import { useEffect, useState } from 'react';
import {
  getDiscoveredRecipes,
  type DiscoveredRecipe,
} from '../services/laboratory';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../libs/components/ui/card';
import { Loader2, BookOpen, ChefHat, Clock, Coins } from 'lucide-react';

// Emojis associés par mot-clé dans le nom de la recette
const getRecipeEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('omelette') || n.includes('œuf') || n.includes('oeuf'))
    return '🍳';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('burger')) return '🍔';
  if (
    n.includes('pâtes') ||
    n.includes('spaghetti') ||
    n.includes('carbonara') ||
    n.includes('bolognaise')
  )
    return '🍝';
  if (n.includes('riz')) return '🍚';
  if (n.includes('soupe')) return '🍲';
  if (n.includes('salade')) return '🥗';
  if (n.includes('poulet')) return '🍗';
  if (
    n.includes('boeuf') ||
    n.includes('burger') ||
    n.includes('steak') ||
    n.includes('hachis')
  )
    return '🥩';
  if (n.includes('saumon') || n.includes('poisson') || n.includes('thon'))
    return '🐟';
  if (
    n.includes('gratin') ||
    n.includes('purée') ||
    n.includes('pomme de terre') ||
    n.includes('dauphinois')
  )
    return '🥔';
  if (n.includes('quiche')) return '🥧';
  if (n.includes('champignon')) return '🍄';
  if (n.includes('bacon')) return '🥓';
  if (n.includes('tomate')) return '🍅';
  if (n.includes('carotte')) return '🥕';
  return '🍽️';
};

// Difficulté estimée selon le nombre d'ingrédients
const getDifficulty = (count: number): { label: string; color: string } => {
  if (count <= 2)
    return {
      label: '⭐ Facile',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
  if (count === 3)
    return {
      label: '⭐⭐ Moyen',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    };
  if (count === 4)
    return {
      label: '⭐⭐⭐ Avancé',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    };
  return {
    label: '⭐⭐⭐⭐ Expert',
    color: 'text-red-600 bg-red-50 border-red-200',
  };
};

// Temps de préparation estimé (fictif mais cohérent)
const getPrepTime = (ingredientCount: number): string => {
  const base = ingredientCount * 5;
  return `~${base} min`;
};

export function RecipeBook() {
  const [recipes, setRecipes] = useState<DiscoveredRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getDiscoveredRecipes();
        setRecipes(data.recipes);
      } catch {
        toast.error('Impossible de charger le livre de recettes');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600 font-medium">Ouverture du livre...</p>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────
  if (recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-block mb-6 p-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-xl">
            <BookOpen className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Livre vide pour l'instant !
          </h2>
          <p className="text-gray-500 text-lg">
            Rendez-vous au{' '}
            <a
              href="/laboratory"
              className="text-amber-600 font-semibold hover:underline"
            >
              Laboratoire
            </a>{' '}
            pour expérimenter et débloquer vos premières recettes.
          </p>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-block mb-4 p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Livre de Recettes
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            {recipes.length} recette{recipes.length > 1 ? 's' : ''} découverte
            {recipes.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => {
            const emoji = getRecipeEmoji(recipe.name);
            const difficulty = getDifficulty(recipe.ingredients.length);
            const prepTime = getPrepTime(recipe.ingredients.length);
            const isExpanded = expandedId === recipe.id;

            return (
              <Card
                key={recipe.id}
                onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                className="
                  bg-white/90 backdrop-blur-sm border-amber-200 shadow-md
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-200 cursor-pointer
                  overflow-hidden
                "
              >
                {/* Bannière colorée avec emoji */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 flex flex-col items-center justify-center gap-2">
                  <span className="text-5xl">{emoji}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full border ${difficulty.color}`}
                  >
                    {difficulty.label}
                  </span>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-800 text-lg leading-tight">
                    {recipe.name}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-1">
                    {/* Prix de vente */}
                    <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                      <Coins className="w-4 h-4" />
                      {parseFloat(String(recipe.sale_price)).toFixed(2)} €
                    </span>
                    {/* Temps estimé */}
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {prepTime}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Date de découverte */}
                  <p className="text-xs text-gray-400 mb-3">
                    Découverte le{' '}
                    {new Date(recipe.discovered_at).toLocaleDateString(
                      'fr-FR',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </p>

                  {/* Ingrédients — masqués par défaut, révélés au clic */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-300
                      ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="border-t border-amber-100 pt-3 mt-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <ChefHat className="w-3 h-3" />
                        Ingrédients
                      </p>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing) => (
                          <li
                            key={ing.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">{ing.name}</span>
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              x{ing.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Hint clic */}
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    {isExpanded ? '▲ Réduire' : '▼ Voir les ingrédients'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
