import sequelize from './config/db';
import './models'; // ← Charge tous les modèles ET les associations
import { Ingredient, Recipe, RecipeIngredient } from './models';

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ Tables synchronisées');

  // 20 ingrédients
  const ingredientsData = [
    { name: 'Tomate', price: 0.5 },
    { name: 'Fromage', price: 1.2 },
    { name: 'Pomme de terre', price: 0.3 },
    { name: 'Oignon', price: 0.4 },
    { name: 'Carotte', price: 0.35 },
    { name: 'Poulet', price: 2 },
    { name: 'Boeuf', price: 3 },
    { name: 'Poivron', price: 0.6 },
    { name: 'Lait', price: 0.8 },
    { name: 'Œuf', price: 0.25 },
    { name: 'Beurre', price: 0.5 },
    { name: 'Sel', price: 0.05 },
    { name: 'Poivre', price: 0.05 },
    { name: 'Pâtes', price: 0.9 },
    { name: 'Riz', price: 0.7 },
    { name: 'Bacon', price: 1.5 },
    { name: 'Crème', price: 0.6 },
    { name: 'Champignon', price: 0.4 },
    { name: 'Thon', price: 1.3 },
    { name: 'Saumon', price: 2.5 },
  ];

  await Ingredient.bulkCreate(ingredientsData);
  console.log('✅ 20 ingrédients créés');

  // 10 recettes
  const recipesData = [
    { name: 'Omelette', sale_price: 5 },
    { name: 'Salade', sale_price: 4 },
    { name: 'Poulet rôti', sale_price: 12 },
    { name: 'Pizza', sale_price: 8 },
    { name: 'Spaghetti Carbonara', sale_price: 7 },
    { name: 'Burger', sale_price: 6 },
    { name: 'Poisson grillé', sale_price: 10 },
    { name: 'Riz sauté', sale_price: 6 },
    { name: 'Soupe de légumes', sale_price: 5 },
    { name: 'Quiche Lorraine', sale_price: 7 },
  ];

  await Recipe.bulkCreate(recipesData);
  console.log('✅ 10 recettes créées');

  // Liaisons recette/ingrédients - TOUTES LES RECETTES COMPLÈTES
  await RecipeIngredient.bulkCreate([
    // 1. Omelette
    { recipe_id: 1, ingredient_id: 10, quantity: 3 }, // Œuf
    { recipe_id: 1, ingredient_id: 11, quantity: 1 }, // Beurre
    { recipe_id: 1, ingredient_id: 12, quantity: 1 }, // Sel
    { recipe_id: 1, ingredient_id: 13, quantity: 1 }, // Poivre

    // 2. Salade
    { recipe_id: 2, ingredient_id: 1, quantity: 2 }, // Tomate
    { recipe_id: 2, ingredient_id: 4, quantity: 1 }, // Oignon
    { recipe_id: 2, ingredient_id: 5, quantity: 1 }, // Carotte
    { recipe_id: 2, ingredient_id: 8, quantity: 1 }, // Poivron

    // 3. Poulet rôti
    { recipe_id: 3, ingredient_id: 6, quantity: 1 }, // Poulet
    { recipe_id: 3, ingredient_id: 3, quantity: 3 }, // Pomme de terre
    { recipe_id: 3, ingredient_id: 5, quantity: 2 }, // Carotte
    { recipe_id: 3, ingredient_id: 11, quantity: 1 }, // Beurre
    { recipe_id: 3, ingredient_id: 12, quantity: 1 }, // Sel
    { recipe_id: 3, ingredient_id: 13, quantity: 1 }, // Poivre

    // 4. Pizza
    { recipe_id: 4, ingredient_id: 1, quantity: 3 }, // Tomate
    { recipe_id: 4, ingredient_id: 2, quantity: 2 }, // Fromage
    { recipe_id: 4, ingredient_id: 4, quantity: 1 }, // Oignon
    { recipe_id: 4, ingredient_id: 8, quantity: 1 }, // Poivron
    { recipe_id: 4, ingredient_id: 18, quantity: 2 }, // Champignon

    // 5. Spaghetti Carbonara
    { recipe_id: 5, ingredient_id: 14, quantity: 2 }, // Pâtes
    { recipe_id: 5, ingredient_id: 16, quantity: 2 }, // Bacon
    { recipe_id: 5, ingredient_id: 10, quantity: 2 }, // Œuf
    { recipe_id: 5, ingredient_id: 2, quantity: 1 }, // Fromage
    { recipe_id: 5, ingredient_id: 13, quantity: 1 }, // Poivre

    // 6. Burger
    { recipe_id: 6, ingredient_id: 7, quantity: 1 }, // Boeuf
    { recipe_id: 6, ingredient_id: 2, quantity: 1 }, // Fromage
    { recipe_id: 6, ingredient_id: 1, quantity: 1 }, // Tomate
    { recipe_id: 6, ingredient_id: 4, quantity: 1 }, // Oignon

    // 7. Poisson grillé
    { recipe_id: 7, ingredient_id: 20, quantity: 1 }, // Saumon
    { recipe_id: 7, ingredient_id: 11, quantity: 1 }, // Beurre
    { recipe_id: 7, ingredient_id: 12, quantity: 1 }, // Sel
    { recipe_id: 7, ingredient_id: 13, quantity: 1 }, // Poivre

    // 8. Riz sauté
    { recipe_id: 8, ingredient_id: 15, quantity: 2 }, // Riz
    { recipe_id: 8, ingredient_id: 10, quantity: 2 }, // Œuf
    { recipe_id: 8, ingredient_id: 5, quantity: 1 }, // Carotte
    { recipe_id: 8, ingredient_id: 8, quantity: 1 }, // Poivron
    { recipe_id: 8, ingredient_id: 4, quantity: 1 }, // Oignon

    // 9. Soupe de légumes
    { recipe_id: 9, ingredient_id: 3, quantity: 2 }, // Pomme de terre
    { recipe_id: 9, ingredient_id: 5, quantity: 2 }, // Carotte
    { recipe_id: 9, ingredient_id: 4, quantity: 1 }, // Oignon
    { recipe_id: 9, ingredient_id: 8, quantity: 1 }, // Poivron
    { recipe_id: 9, ingredient_id: 12, quantity: 1 }, // Sel
    { recipe_id: 9, ingredient_id: 13, quantity: 1 }, // Poivre

    // 10. Quiche Lorraine
    { recipe_id: 10, ingredient_id: 10, quantity: 3 }, // Œuf
    { recipe_id: 10, ingredient_id: 16, quantity: 2 }, // Bacon
    { recipe_id: 10, ingredient_id: 17, quantity: 1 }, // Crème
    { recipe_id: 10, ingredient_id: 2, quantity: 1 }, // Fromage
    { recipe_id: 10, ingredient_id: 12, quantity: 1 }, // Sel
    { recipe_id: 10, ingredient_id: 13, quantity: 1 }, // Poivre
  ]);
  console.log('✅ Associations recettes-ingrédients créées');

  console.log('🎉 Seed terminé avec succès !');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Erreur lors du seed:', error);
  process.exit(1);
});
