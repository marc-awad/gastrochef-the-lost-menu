import { useEffect, useState } from 'react';
import { useIngredients, type Ingredient } from '../hooks/useIngredients';
import { experimentWithIngredients } from '../services/laboratory';
import { toast } from 'sonner';
import { IngredientCard } from '../components/IngredientCard';
import { DropZone } from '../components/DropZone';
import { Button } from '../libs/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../libs/components/ui/card';
import { Loader2, Beaker, Sparkles, Info } from 'lucide-react';

export function Laboratory() {
  const { ingredients, loading, error } = useIngredients();
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [draggedIngredient, setDraggedIngredient] = useState<Ingredient | null>(
    null
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isExperimenting, setIsExperimenting] = useState(false);

  // ✅ TICKET #022 : Détection mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ TICKET #022 : Click pour sélectionner sur mobile
  const handleIngredientClick = (ingredient: Ingredient) => {
    if (isMobile) {
      if (!selectedIngredients.find((i) => i.id === ingredient.id)) {
        setSelectedIngredients([...selectedIngredients, ingredient]);
        toast.info(`${ingredient.name} ajouté`, { duration: 1000 });
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, ingredient: Ingredient) => {
    setDraggedIngredient(ingredient);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedIngredient(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (
      draggedIngredient &&
      !selectedIngredients.find((i) => i.id === draggedIngredient.id)
    ) {
      setSelectedIngredients([...selectedIngredients, draggedIngredient]);
    }
    setDraggedIngredient(null);
  };

  const handleRemoveIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(
      selectedIngredients.filter((i) => i.id !== ingredient.id)
    );
  };

  const handleExperiment = async () => {
    if (selectedIngredients.length < 2) return;

    setIsExperimenting(true);
    const ingredientIds = selectedIngredients.map((i) => i.id);

    try {
      const result = await experimentWithIngredients(ingredientIds);

      if (result.success && result.discovered) {
        toast.success(result.message, {
          description: `Vous avez découvert : ${result.recipe?.name} (${result.recipe?.sale_price}€)`,
          duration: 5000,
        });
        setSelectedIngredients([]);
      } else if (result.success && result.alreadyKnown) {
        toast.info(result.message, {
          description: `Recette : ${result.recipe?.name}`,
        });
      } else {
        toast.error(result.message, {
          description: 'Essayez une autre combinaison !',
        });
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'expérimentation", {
        description: error.response?.data?.message || 'Une erreur est survenue',
      });
    } finally {
      setIsExperimenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-gray-600 font-medium">
            Chargement des ingrédients...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 px-4">
        <Card className="border-red-300 bg-white shadow-lg max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* ✅ TICKET #022 : Header responsive */}
        <div className="mb-6 md:mb-8 text-center">
          <div className="inline-block mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
            <Beaker className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Le Laboratoire
          </h1>
          <p className="text-gray-600 text-sm md:text-base lg:text-lg font-medium px-4">
            {isMobile
              ? 'Cliquez sur les ingrédients'
              : 'Glissez des ingrédients'}{' '}
            pour découvrir de nouvelles recettes
          </p>
        </div>

        {/* ✅ TICKET #022 : Info bulle mobile */}
        {isMobile && (
          <div className="mb-4 mx-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Mode tactile :</strong> Cliquez sur un ingrédient pour le
              sélectionner, puis sur "Expérimenter"
            </p>
          </div>
        )}

        {/* Drop Zone */}
        <div className="mb-6 md:mb-8" onDragLeave={handleDragLeave}>
          <DropZone
            selectedIngredients={selectedIngredients}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onRemoveIngredient={handleRemoveIngredient}
            isDraggingOver={isDraggingOver}
          />
        </div>

        {/* ✅ TICKET #022 : Bouton responsive avec zones tactiles 48px+ */}
        <div className="mb-6 md:mb-8 flex justify-center px-4">
          <Button
            size="lg"
            onClick={handleExperiment}
            disabled={selectedIngredients.length < 2 || isExperimenting}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[48px]"
          >
            {isExperimenting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">
                  Expérimentation en cours...
                </span>
                <span className="sm:hidden">Expérimentation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">
                  Expérimenter ({selectedIngredients.length}/2 min)
                </span>
                <span className="sm:hidden">
                  Expérimenter ({selectedIngredients.length}/2)
                </span>
              </>
            )}
          </Button>
        </div>

        {/* ✅ TICKET #022 : Grille responsive adaptative */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-violet-200">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <span className="text-xl md:text-2xl">📦</span>
              <span>Ingrédients disponibles</span>
              <span className="text-sm opacity-90">({ingredients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6">
            {/* ✅ TICKET #022 : Grille ultra-responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleIngredientClick(ingredient)}
                  className={isMobile ? 'cursor-pointer' : ''}
                >
                  <IngredientCard
                    ingredient={ingredient}
                    onDragStart={handleDragStart}
                    isDragging={draggedIngredient?.id === ingredient.id}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
