import axios from './api';

// ─── Types ────────────────────────────────────────────────────

export interface RecipeIngredient {
  id: number;
  name: string;
  quantity: number;
}

export interface DiscoveredRecipe {
  id: number;
  name: string;
  description: string | null;
  sale_price: number;
  discovered_at: string;
  ingredients: RecipeIngredient[];
}

export interface ExperimentResponse {
  success: boolean;
  message: string;
  recipe?: {
    id: number;
    name: string;
    sale_price: number;
    ingredients?: RecipeIngredient[];
  };
  discovered: boolean;
  alreadyKnown?: boolean;
}

export interface DiscoveredRecipesResponse {
  success: boolean;
  count: number;
  recipes: DiscoveredRecipe[];
}

// ─── Appels API ───────────────────────────────────────────────

// Tenter une combinaison d'ingrédients au laboratoire
export const experimentWithIngredients = async (
  ingredientIds: number[]
): Promise<ExperimentResponse> => {
  const response = await axios.post<ExperimentResponse>(
    '/laboratory/experiment',
    { ingredientIds }
  );
  return response.data;
};

// Récupérer toutes les recettes découvertes par le joueur connecté
export const getDiscoveredRecipes =
  async (): Promise<DiscoveredRecipesResponse> => {
    const response =
      await axios.get<DiscoveredRecipesResponse>('/user/recipes');
    return response.data;
  };
