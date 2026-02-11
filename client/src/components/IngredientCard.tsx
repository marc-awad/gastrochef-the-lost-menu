import { Card } from '../libs/components/ui/card';
import { cn } from '../libs/utils';
import type { Ingredient } from '../hooks/useIngredients';

interface IngredientCardProps {
  ingredient: Ingredient;
  onDragStart?: (e: React.DragEvent, ingredient: Ingredient) => void;
  onRemove?: (ingredient: Ingredient) => void;
  isDragging?: boolean;
  isInDropZone?: boolean;
}

export function IngredientCard({
  ingredient,
  onDragStart,
  onRemove,
  isDragging = false,
  isInDropZone = false,
}: IngredientCardProps) {
  return (
    <Card
      draggable={!isInDropZone}
      onDragStart={(e) => onDragStart?.(e, ingredient)}
      onClick={() => isInDropZone && onRemove?.(ingredient)}
      className={cn(
        'relative p-4 cursor-move transition-all duration-200 hover:shadow-lg hover:scale-105',
        isDragging && 'opacity-50',
        isInDropZone &&
          'cursor-pointer border-2 border-primary hover:bg-destructive/10'
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <span className="text-2xl">🥕</span>
        </div>
        <h3 className="font-semibold text-sm text-center">{ingredient.name}</h3>
        <p className="text-xs text-muted-foreground">
          {parseFloat(ingredient.price).toFixed(2)}€
        </p>
        {isInDropZone && (
          <span className="text-xs text-destructive font-medium">
            Cliquer pour retirer
          </span>
        )}
      </div>
    </Card>
  );
}
