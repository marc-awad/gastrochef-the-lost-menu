import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Ingredient {
  id: number;
  name: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:5000/api/ingredients'
        );
        setIngredients(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des ingrédients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  return { ingredients, loading, error };
}
