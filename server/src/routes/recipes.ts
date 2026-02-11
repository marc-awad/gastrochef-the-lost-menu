import { Router } from 'express';
import { Recipe } from '../models/Recipe';

const router = Router();

router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    console.error('Erreur recipes:', error); // ← Pour voir l'erreur exacte
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des recettes' });
  }
});

export default router;
