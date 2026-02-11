import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../libs/components/ui/card';
import { cn } from '../libs/utils';
import type { Ingredient } from '../hooks/useIngredients';
import { IngredientCard } from './IngredientCard';

interface DropZoneProps {
  selectedIngredients: Ingredient[];
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemoveIngredient: (ingredient: Ingredient) => void;
  isDraggingOver: boolean;
}

export function DropZone({
  selectedIngredients,
  onDrop,
  onDragOver,
  onRemoveIngredient,
  isDraggingOver,
}: DropZoneProps) {
  return (
    <Card
      className={cn(
        'border-2 border-dashed transition-all duration-200',
        isDraggingOver && 'border-primary bg-primary/5 scale-[1.02]',
        selectedIngredients.length === 0 && 'bg-muted/30'
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧪 Ingrédients sélectionnés</span>
          <span className="text-sm font-normal text-muted-foreground">
            {selectedIngredients.length} ingrédient
            {selectedIngredients.length > 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedIngredients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">👇 Glissez des ingrédients ici</p>
            <p className="text-sm">Minimum 2 ingrédients pour expérimenter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedIngredients.map((ingredient) => (
              <IngredientCard
                key={`selected-${ingredient.id}`}
                ingredient={ingredient}
                onRemove={onRemoveIngredient}
                isInDropZone
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
