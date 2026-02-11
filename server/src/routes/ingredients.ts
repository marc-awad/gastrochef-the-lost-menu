import { Router } from 'express';
import { Ingredient } from '../models/Ingredient';

const router = Router();

router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    res.json(ingredients);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des ingrédients' });
  }
});

export default router;
