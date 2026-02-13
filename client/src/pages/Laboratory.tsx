import { useEffect, useState } from 'react';
import { useIngredients, type Ingredient } from '../hooks/useIngredients';
import { experimentWithIngredients } from '../services/laboratory'; // ✅ NOUVEAU
import { toast } from 'sonner'; // ✅ NOUVEAU
import { IngredientCard } from '../components/IngredientCard';
import { DropZone } from '../components/DropZone';
import { Button } from '../libs/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../libs/components/ui/card';
import { Loader2, Beaker, Sparkles } from 'lucide-react';
import { connectSocket, disconnectSocket } from '../services/socket';

export function Laboratory() {
  // TEST : connexion au socket dès que le composant est monté
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);
  const { ingredients, loading, error } = useIngredients();
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [draggedIngredient, setDraggedIngredient] = useState<Ingredient | null>(
    null
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isExperimenting, setIsExperimenting] = useState(false); // ✅ NOUVEAU

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

  // ✅ NOUVELLE FONCTION
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
        setSelectedIngredients([]); // Reset après succès
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
        <Card className="border-red-300 bg-white shadow-lg">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
            <Beaker className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Le Laboratoire
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Glissez des ingrédients pour découvrir de nouvelles recettes
          </p>
        </div>

        {/* Drop Zone */}
        <div className="mb-8" onDragLeave={handleDragLeave}>
          <DropZone
            selectedIngredients={selectedIngredients}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onRemoveIngredient={handleRemoveIngredient}
            isDraggingOver={isDraggingOver}
          />
        </div>

        {/* Experiment Button */}
        <div className="mb-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleExperiment}
            disabled={selectedIngredients.length < 2 || isExperimenting}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExperimenting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Expérimentation en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Expérimenter ({selectedIngredients.length}/2 min)
              </>
            )}
          </Button>
        </div>

        {/* Available Ingredients */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-violet-200">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">📦</span>
              Ingrédients disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} onDragEnd={handleDragEnd}>
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
