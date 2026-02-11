import axios from './api';

export interface ExperimentResponse {
  success: boolean;
  message: string;
  recipe?: {
    id: number;
    name: string;
    sale_price: string;
  };
  discovered: boolean;
  alreadyKnown?: boolean;
}

export const experimentWithIngredients = async (
  ingredientIds: number[]
): Promise<ExperimentResponse> => {
  const response = await axios.post<ExperimentResponse>(
    '/laboratory/experiment',
    { ingredientIds }
  );
  return response.data;
};
