import sequelize from './config/db';
import './models'; // ← Charge tous les modèles ET les associations
import { Ingredient, Recipe, RecipeIngredient } from './models';

// ============================================================
//  RÉFÉRENCE DES INGRÉDIENTS (IDs 1 → 20)
// ============================================================
//  1  - Tomate          0.50
//  2  - Fromage         1.20
//  3  - Pomme de terre  0.30
//  4  - Oignon          0.40
//  5  - Carotte         0.35
//  6  - Poulet          2.00
//  7  - Boeuf           3.00
//  8  - Poivron         0.60
//  9  - Lait            0.80
//  10 - Œuf             0.25
//  11 - Beurre          0.50
//  12 - Sel             0.05
//  13 - Poivre          0.05
//  14 - Pâtes           0.90
//  15 - Riz             0.70
//  16 - Bacon           1.50
//  17 - Crème           0.60
//  18 - Champignon      0.40
//  19 - Thon            1.30
//  20 - Saumon          2.50
// ============================================================

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ Tables synchronisées');

  // ──────────────────────────────────────────────
  //  20 INGRÉDIENTS
  // ──────────────────────────────────────────────
  const ingredientsData = [
    { name: 'Tomate', price: 0.5 }, // 1
    { name: 'Fromage', price: 1.2 }, // 2
    { name: 'Pomme de terre', price: 0.3 }, // 3
    { name: 'Oignon', price: 0.4 }, // 4
    { name: 'Carotte', price: 0.35 }, // 5
    { name: 'Poulet', price: 2.0 }, // 6
    { name: 'Boeuf', price: 3.0 }, // 7
    { name: 'Poivron', price: 0.6 }, // 8
    { name: 'Lait', price: 0.8 }, // 9
    { name: 'Œuf', price: 0.25 }, // 10
    { name: 'Beurre', price: 0.5 }, // 11
    { name: 'Sel', price: 0.05 }, // 12
    { name: 'Poivre', price: 0.05 }, // 13
    { name: 'Pâtes', price: 0.9 }, // 14
    { name: 'Riz', price: 0.7 }, // 15
    { name: 'Bacon', price: 1.5 }, // 16
    { name: 'Crème', price: 0.6 }, // 17
    { name: 'Champignon', price: 0.4 }, // 18
    { name: 'Thon', price: 1.3 }, // 19
    { name: 'Saumon', price: 2.5 }, // 20
  ];

  await Ingredient.bulkCreate(ingredientsData);
  console.log('✅ 20 ingrédients créés');

  // ──────────────────────────────────────────────
  //  50 RECETTES
  //  Difficulté indiquée en commentaire :
  //    ⭐    = 2 ingrédients  (facile à découvrir)
  //    ⭐⭐   = 3 ingrédients  (intermédiaire)
  //    ⭐⭐⭐  = 4 ingrédients  (avancé)
  //    ⭐⭐⭐⭐ = 5-6 ingrédients (expert)
  // ──────────────────────────────────────────────
  const recipesData = [
    // ── NIVEAU ⭐ : 2 ingrédients ──────────────────────────────
    { name: 'Œufs au beurre', sale_price: 3 }, // 1
    { name: 'Salade tomate-oignon', sale_price: 3 }, // 2
    { name: 'Pâtes au beurre', sale_price: 3 }, // 3
    { name: 'Riz au lait', sale_price: 3 }, // 4
    { name: 'Saumon au beurre', sale_price: 7 }, // 5
    { name: 'Steak poivré', sale_price: 8 }, // 6
    { name: 'Tomate-fromage', sale_price: 4 }, // 7
    { name: 'Carotte-oignon sauté', sale_price: 3 }, // 8
    { name: 'Champignons sautés', sale_price: 4 }, // 9
    { name: 'Bacon croustillant', sale_price: 5 }, // 10

    // ── NIVEAU ⭐⭐ : 3 ingrédients ────────────────────────────
    { name: 'Omelette simple', sale_price: 5 }, // 11
    { name: 'Poulet sauté', sale_price: 7 }, // 12
    { name: 'Soupe carotte', sale_price: 5 }, // 13
    { name: 'Purée maison', sale_price: 5 }, // 14
    { name: 'Riz sauté simple', sale_price: 5 }, // 15
    { name: 'Pâtes sauce tomate', sale_price: 5 }, // 16
    { name: 'Salade cesar basique', sale_price: 6 }, // 17
    { name: 'Champignons à la crème', sale_price: 6 }, // 18
    { name: 'Salade thon-tomate', sale_price: 6 }, // 19
    { name: 'Escalope crème', sale_price: 8 }, // 20
    { name: 'Poisson sel-beurre', sale_price: 7 }, // 21
    { name: 'Omelette fromage', sale_price: 6 }, // 22
    { name: 'Soupe oignon', sale_price: 5 }, // 23
    { name: 'Riz poulet basique', sale_price: 7 }, // 24
    { name: 'Pâtes carbonara simple', sale_price: 6 }, // 25

    // ── NIVEAU ⭐⭐⭐ : 4 ingrédients ──────────────────────────
    { name: 'Omelette complète', sale_price: 7 }, // 26
    { name: 'Burger classique', sale_price: 8 }, // 27
    { name: 'Salade composée', sale_price: 6 }, // 28
    { name: 'Riz cantonais', sale_price: 7 }, // 29
    { name: 'Poulet chasseur', sale_price: 10 }, // 30
    { name: 'Poisson grillé', sale_price: 10 }, // 31
    { name: 'Tarte thon-tomate', sale_price: 8 }, // 32
    { name: 'Gratin de pâtes', sale_price: 7 }, // 33
    { name: 'Saumon crème-champignon', sale_price: 12 }, // 34
    { name: 'Boeuf carotte', sale_price: 11 }, // 35
    { name: 'Poulet rôti simple', sale_price: 9 }, // 36
    { name: 'Riz sauté légumes', sale_price: 7 }, // 37
    { name: 'Pâtes bacon-crème', sale_price: 8 }, // 38
    { name: 'Salade niçoise', sale_price: 8 }, // 39
    { name: 'Gratin de pommes de terre', sale_price: 8 }, // 40

    // ── NIVEAU ⭐⭐⭐⭐ : 5-6 ingrédients ──────────────────────
    { name: 'Pizza', sale_price: 9 }, // 41
    { name: 'Spaghetti Carbonara', sale_price: 9 }, // 42
    { name: 'Poulet rôti complet', sale_price: 13 }, // 43
    { name: 'Quiche Lorraine', sale_price: 9 }, // 44
    { name: 'Soupe de légumes', sale_price: 7 }, // 45
    { name: 'Hachis Parmentier', sale_price: 11 }, // 46
    { name: 'Riz sauté complet', sale_price: 9 }, // 47
    { name: 'Gratin dauphinois', sale_price: 10 }, // 48
    { name: 'Spaghetti bolognaise', sale_price: 10 }, // 49
    { name: 'Poulet basquaise', sale_price: 12 }, // 50
  ];

  await Recipe.bulkCreate(recipesData);
  console.log('✅ 50 recettes créées');

  // ──────────────────────────────────────────────
  //  ASSOCIATIONS RECETTE ↔ INGRÉDIENTS
  // ──────────────────────────────────────────────
  await RecipeIngredient.bulkCreate([
    // ════════════════════════════════════════════
    //  NIVEAU ⭐ — 2 ingrédients
    // ════════════════════════════════════════════

    // 1. Œufs au beurre : Œuf(10) + Beurre(11)
    { recipe_id: 1, ingredient_id: 10, quantity: 2 },
    { recipe_id: 1, ingredient_id: 11, quantity: 1 },

    // 2. Salade tomate-oignon : Tomate(1) + Oignon(4)
    { recipe_id: 2, ingredient_id: 1, quantity: 2 },
    { recipe_id: 2, ingredient_id: 4, quantity: 1 },

    // 3. Pâtes au beurre : Pâtes(14) + Beurre(11)
    { recipe_id: 3, ingredient_id: 14, quantity: 2 },
    { recipe_id: 3, ingredient_id: 11, quantity: 1 },

    // 4. Riz au lait : Riz(15) + Lait(9)
    { recipe_id: 4, ingredient_id: 15, quantity: 2 },
    { recipe_id: 4, ingredient_id: 9, quantity: 2 },

    // 5. Saumon au beurre : Saumon(20) + Beurre(11)
    { recipe_id: 5, ingredient_id: 20, quantity: 1 },
    { recipe_id: 5, ingredient_id: 11, quantity: 1 },

    // 6. Steak poivré : Boeuf(7) + Poivre(13)
    { recipe_id: 6, ingredient_id: 7, quantity: 1 },
    { recipe_id: 6, ingredient_id: 13, quantity: 1 },

    // 7. Tomate-fromage : Tomate(1) + Fromage(2)
    { recipe_id: 7, ingredient_id: 1, quantity: 2 },
    { recipe_id: 7, ingredient_id: 2, quantity: 1 },

    // 8. Carotte-oignon sauté : Carotte(5) + Oignon(4)
    { recipe_id: 8, ingredient_id: 5, quantity: 2 },
    { recipe_id: 8, ingredient_id: 4, quantity: 1 },

    // 9. Champignons sautés : Champignon(18) + Beurre(11)
    { recipe_id: 9, ingredient_id: 18, quantity: 3 },
    { recipe_id: 9, ingredient_id: 11, quantity: 1 },

    // 10. Bacon croustillant : Bacon(16) + Poivre(13)
    { recipe_id: 10, ingredient_id: 16, quantity: 2 },
    { recipe_id: 10, ingredient_id: 13, quantity: 1 },

    // ════════════════════════════════════════════
    //  NIVEAU ⭐⭐ — 3 ingrédients
    // ════════════════════════════════════════════

    // 11. Omelette simple : Œuf(10) + Beurre(11) + Sel(12)
    { recipe_id: 11, ingredient_id: 10, quantity: 3 },
    { recipe_id: 11, ingredient_id: 11, quantity: 1 },
    { recipe_id: 11, ingredient_id: 12, quantity: 1 },

    // 12. Poulet sauté : Poulet(6) + Oignon(4) + Sel(12)
    { recipe_id: 12, ingredient_id: 6, quantity: 1 },
    { recipe_id: 12, ingredient_id: 4, quantity: 1 },
    { recipe_id: 12, ingredient_id: 12, quantity: 1 },

    // 13. Soupe carotte : Carotte(5) + Oignon(4) + Sel(12)
    { recipe_id: 13, ingredient_id: 5, quantity: 3 },
    { recipe_id: 13, ingredient_id: 4, quantity: 1 },
    { recipe_id: 13, ingredient_id: 12, quantity: 1 },

    // 14. Purée maison : Pomme de terre(3) + Beurre(11) + Lait(9)
    { recipe_id: 14, ingredient_id: 3, quantity: 4 },
    { recipe_id: 14, ingredient_id: 11, quantity: 1 },
    { recipe_id: 14, ingredient_id: 9, quantity: 1 },

    // 15. Riz sauté simple : Riz(15) + Œuf(10) + Sel(12)
    { recipe_id: 15, ingredient_id: 15, quantity: 2 },
    { recipe_id: 15, ingredient_id: 10, quantity: 2 },
    { recipe_id: 15, ingredient_id: 12, quantity: 1 },

    // 16. Pâtes sauce tomate : Pâtes(14) + Tomate(1) + Oignon(4)
    { recipe_id: 16, ingredient_id: 14, quantity: 2 },
    { recipe_id: 16, ingredient_id: 1, quantity: 2 },
    { recipe_id: 16, ingredient_id: 4, quantity: 1 },

    // 17. Salade cesar basique : Tomate(1) + Fromage(2) + Poulet(6)
    { recipe_id: 17, ingredient_id: 1, quantity: 2 },
    { recipe_id: 17, ingredient_id: 2, quantity: 1 },
    { recipe_id: 17, ingredient_id: 6, quantity: 1 },

    // 18. Champignons à la crème : Champignon(18) + Crème(17) + Sel(12)
    { recipe_id: 18, ingredient_id: 18, quantity: 3 },
    { recipe_id: 18, ingredient_id: 17, quantity: 1 },
    { recipe_id: 18, ingredient_id: 12, quantity: 1 },

    // 19. Salade thon-tomate : Thon(19) + Tomate(1) + Oignon(4)
    { recipe_id: 19, ingredient_id: 19, quantity: 1 },
    { recipe_id: 19, ingredient_id: 1, quantity: 2 },
    { recipe_id: 19, ingredient_id: 4, quantity: 1 },

    // 20. Escalope crème : Poulet(6) + Crème(17) + Champignon(18)
    { recipe_id: 20, ingredient_id: 6, quantity: 1 },
    { recipe_id: 20, ingredient_id: 17, quantity: 1 },
    { recipe_id: 20, ingredient_id: 18, quantity: 2 },

    // 21. Poisson sel-beurre : Saumon(20) + Sel(12) + Beurre(11)
    { recipe_id: 21, ingredient_id: 20, quantity: 1 },
    { recipe_id: 21, ingredient_id: 12, quantity: 1 },
    { recipe_id: 21, ingredient_id: 11, quantity: 1 },

    // 22. Omelette fromage : Œuf(10) + Fromage(2) + Beurre(11)
    { recipe_id: 22, ingredient_id: 10, quantity: 3 },
    { recipe_id: 22, ingredient_id: 2, quantity: 1 },
    { recipe_id: 22, ingredient_id: 11, quantity: 1 },

    // 23. Soupe oignon : Oignon(4) + Beurre(11) + Sel(12)
    { recipe_id: 23, ingredient_id: 4, quantity: 3 },
    { recipe_id: 23, ingredient_id: 11, quantity: 1 },
    { recipe_id: 23, ingredient_id: 12, quantity: 1 },

    // 24. Riz poulet basique : Riz(15) + Poulet(6) + Sel(12)
    { recipe_id: 24, ingredient_id: 15, quantity: 2 },
    { recipe_id: 24, ingredient_id: 6, quantity: 1 },
    { recipe_id: 24, ingredient_id: 12, quantity: 1 },

    // 25. Pâtes carbonara simple : Pâtes(14) + Bacon(16) + Œuf(10)
    { recipe_id: 25, ingredient_id: 14, quantity: 2 },
    { recipe_id: 25, ingredient_id: 16, quantity: 2 },
    { recipe_id: 25, ingredient_id: 10, quantity: 2 },

    // ════════════════════════════════════════════
    //  NIVEAU ⭐⭐⭐ — 4 ingrédients
    // ════════════════════════════════════════════

    // 26. Omelette complète : Œuf(10) + Beurre(11) + Sel(12) + Poivre(13)
    { recipe_id: 26, ingredient_id: 10, quantity: 3 },
    { recipe_id: 26, ingredient_id: 11, quantity: 1 },
    { recipe_id: 26, ingredient_id: 12, quantity: 1 },
    { recipe_id: 26, ingredient_id: 13, quantity: 1 },

    // 27. Burger classique : Boeuf(7) + Fromage(2) + Tomate(1) + Oignon(4)
    { recipe_id: 27, ingredient_id: 7, quantity: 1 },
    { recipe_id: 27, ingredient_id: 2, quantity: 1 },
    { recipe_id: 27, ingredient_id: 1, quantity: 1 },
    { recipe_id: 27, ingredient_id: 4, quantity: 1 },

    // 28. Salade composée : Tomate(1) + Carotte(5) + Oignon(4) + Poivron(8)
    { recipe_id: 28, ingredient_id: 1, quantity: 2 },
    { recipe_id: 28, ingredient_id: 5, quantity: 1 },
    { recipe_id: 28, ingredient_id: 4, quantity: 1 },
    { recipe_id: 28, ingredient_id: 8, quantity: 1 },

    // 29. Riz cantonais : Riz(15) + Œuf(10) + Carotte(5) + Oignon(4)
    { recipe_id: 29, ingredient_id: 15, quantity: 2 },
    { recipe_id: 29, ingredient_id: 10, quantity: 2 },
    { recipe_id: 29, ingredient_id: 5, quantity: 1 },
    { recipe_id: 29, ingredient_id: 4, quantity: 1 },

    // 30. Poulet chasseur : Poulet(6) + Tomate(1) + Champignon(18) + Oignon(4)
    { recipe_id: 30, ingredient_id: 6, quantity: 1 },
    { recipe_id: 30, ingredient_id: 1, quantity: 2 },
    { recipe_id: 30, ingredient_id: 18, quantity: 2 },
    { recipe_id: 30, ingredient_id: 4, quantity: 1 },

    // 31. Poisson grillé : Saumon(20) + Beurre(11) + Sel(12) + Poivre(13)
    { recipe_id: 31, ingredient_id: 20, quantity: 1 },
    { recipe_id: 31, ingredient_id: 11, quantity: 1 },
    { recipe_id: 31, ingredient_id: 12, quantity: 1 },
    { recipe_id: 31, ingredient_id: 13, quantity: 1 },

    // 32. Tarte thon-tomate : Thon(19) + Tomate(1) + Fromage(2) + Oignon(4)
    { recipe_id: 32, ingredient_id: 19, quantity: 1 },
    { recipe_id: 32, ingredient_id: 1, quantity: 2 },
    { recipe_id: 32, ingredient_id: 2, quantity: 1 },
    { recipe_id: 32, ingredient_id: 4, quantity: 1 },

    // 33. Gratin de pâtes : Pâtes(14) + Fromage(2) + Crème(17) + Sel(12)
    { recipe_id: 33, ingredient_id: 14, quantity: 2 },
    { recipe_id: 33, ingredient_id: 2, quantity: 2 },
    { recipe_id: 33, ingredient_id: 17, quantity: 1 },
    { recipe_id: 33, ingredient_id: 12, quantity: 1 },

    // 34. Saumon crème-champignon : Saumon(20) + Crème(17) + Champignon(18) + Sel(12)
    { recipe_id: 34, ingredient_id: 20, quantity: 1 },
    { recipe_id: 34, ingredient_id: 17, quantity: 1 },
    { recipe_id: 34, ingredient_id: 18, quantity: 2 },
    { recipe_id: 34, ingredient_id: 12, quantity: 1 },

    // 35. Boeuf carotte : Boeuf(7) + Carotte(5) + Oignon(4) + Sel(12)
    { recipe_id: 35, ingredient_id: 7, quantity: 1 },
    { recipe_id: 35, ingredient_id: 5, quantity: 3 },
    { recipe_id: 35, ingredient_id: 4, quantity: 1 },
    { recipe_id: 35, ingredient_id: 12, quantity: 1 },

    // 36. Poulet rôti simple : Poulet(6) + Beurre(11) + Sel(12) + Poivre(13)
    { recipe_id: 36, ingredient_id: 6, quantity: 1 },
    { recipe_id: 36, ingredient_id: 11, quantity: 1 },
    { recipe_id: 36, ingredient_id: 12, quantity: 1 },
    { recipe_id: 36, ingredient_id: 13, quantity: 1 },

    // 37. Riz sauté légumes : Riz(15) + Carotte(5) + Poivron(8) + Oignon(4)
    { recipe_id: 37, ingredient_id: 15, quantity: 2 },
    { recipe_id: 37, ingredient_id: 5, quantity: 1 },
    { recipe_id: 37, ingredient_id: 8, quantity: 1 },
    { recipe_id: 37, ingredient_id: 4, quantity: 1 },

    // 38. Pâtes bacon-crème : Pâtes(14) + Bacon(16) + Crème(17) + Fromage(2)
    { recipe_id: 38, ingredient_id: 14, quantity: 2 },
    { recipe_id: 38, ingredient_id: 16, quantity: 2 },
    { recipe_id: 38, ingredient_id: 17, quantity: 1 },
    { recipe_id: 38, ingredient_id: 2, quantity: 1 },

    // 39. Salade niçoise : Thon(19) + Tomate(1) + Œuf(10) + Sel(12)
    { recipe_id: 39, ingredient_id: 19, quantity: 1 },
    { recipe_id: 39, ingredient_id: 1, quantity: 2 },
    { recipe_id: 39, ingredient_id: 10, quantity: 2 },
    { recipe_id: 39, ingredient_id: 12, quantity: 1 },

    // 40. Gratin de pommes de terre : Pomme de terre(3) + Fromage(2) + Crème(17) + Sel(12)
    { recipe_id: 40, ingredient_id: 3, quantity: 4 },
    { recipe_id: 40, ingredient_id: 2, quantity: 2 },
    { recipe_id: 40, ingredient_id: 17, quantity: 1 },
    { recipe_id: 40, ingredient_id: 12, quantity: 1 },

    // ════════════════════════════════════════════
    //  NIVEAU ⭐⭐⭐⭐ — 5-6 ingrédients
    // ════════════════════════════════════════════

    // 41. Pizza : Tomate(1) + Fromage(2) + Oignon(4) + Poivron(8) + Champignon(18)
    { recipe_id: 41, ingredient_id: 1, quantity: 3 },
    { recipe_id: 41, ingredient_id: 2, quantity: 2 },
    { recipe_id: 41, ingredient_id: 4, quantity: 1 },
    { recipe_id: 41, ingredient_id: 8, quantity: 1 },
    { recipe_id: 41, ingredient_id: 18, quantity: 2 },

    // 42. Spaghetti Carbonara : Pâtes(14) + Bacon(16) + Œuf(10) + Fromage(2) + Poivre(13)
    { recipe_id: 42, ingredient_id: 14, quantity: 2 },
    { recipe_id: 42, ingredient_id: 16, quantity: 2 },
    { recipe_id: 42, ingredient_id: 10, quantity: 2 },
    { recipe_id: 42, ingredient_id: 2, quantity: 1 },
    { recipe_id: 42, ingredient_id: 13, quantity: 1 },

    // 43. Poulet rôti complet : Poulet(6) + Pomme de terre(3) + Carotte(5) + Beurre(11) + Sel(12) + Poivre(13)
    { recipe_id: 43, ingredient_id: 6, quantity: 1 },
    { recipe_id: 43, ingredient_id: 3, quantity: 3 },
    { recipe_id: 43, ingredient_id: 5, quantity: 2 },
    { recipe_id: 43, ingredient_id: 11, quantity: 1 },
    { recipe_id: 43, ingredient_id: 12, quantity: 1 },
    { recipe_id: 43, ingredient_id: 13, quantity: 1 },

    // 44. Quiche Lorraine : Œuf(10) + Bacon(16) + Crème(17) + Fromage(2) + Sel(12) + Poivre(13)
    { recipe_id: 44, ingredient_id: 10, quantity: 3 },
    { recipe_id: 44, ingredient_id: 16, quantity: 2 },
    { recipe_id: 44, ingredient_id: 17, quantity: 1 },
    { recipe_id: 44, ingredient_id: 2, quantity: 1 },
    { recipe_id: 44, ingredient_id: 12, quantity: 1 },
    { recipe_id: 44, ingredient_id: 13, quantity: 1 },

    // 45. Soupe de légumes : Pomme de terre(3) + Carotte(5) + Oignon(4) + Poivron(8) + Sel(12) + Poivre(13)
    { recipe_id: 45, ingredient_id: 3, quantity: 2 },
    { recipe_id: 45, ingredient_id: 5, quantity: 2 },
    { recipe_id: 45, ingredient_id: 4, quantity: 1 },
    { recipe_id: 45, ingredient_id: 8, quantity: 1 },
    { recipe_id: 45, ingredient_id: 12, quantity: 1 },
    { recipe_id: 45, ingredient_id: 13, quantity: 1 },

    // 46. Hachis Parmentier : Boeuf(7) + Pomme de terre(3) + Oignon(4) + Beurre(11) + Sel(12)
    { recipe_id: 46, ingredient_id: 7, quantity: 1 },
    { recipe_id: 46, ingredient_id: 3, quantity: 4 },
    { recipe_id: 46, ingredient_id: 4, quantity: 1 },
    { recipe_id: 46, ingredient_id: 11, quantity: 1 },
    { recipe_id: 46, ingredient_id: 12, quantity: 1 },

    // 47. Riz sauté complet : Riz(15) + Œuf(10) + Carotte(5) + Poivron(8) + Oignon(4)
    { recipe_id: 47, ingredient_id: 15, quantity: 2 },
    { recipe_id: 47, ingredient_id: 10, quantity: 2 },
    { recipe_id: 47, ingredient_id: 5, quantity: 1 },
    { recipe_id: 47, ingredient_id: 8, quantity: 1 },
    { recipe_id: 47, ingredient_id: 4, quantity: 1 },

    // 48. Gratin dauphinois : Pomme de terre(3) + Crème(17) + Lait(9) + Fromage(2) + Sel(12)
    { recipe_id: 48, ingredient_id: 3, quantity: 5 },
    { recipe_id: 48, ingredient_id: 17, quantity: 1 },
    { recipe_id: 48, ingredient_id: 9, quantity: 1 },
    { recipe_id: 48, ingredient_id: 2, quantity: 2 },
    { recipe_id: 48, ingredient_id: 12, quantity: 1 },

    // 49. Spaghetti bolognaise : Pâtes(14) + Boeuf(7) + Tomate(1) + Oignon(4) + Sel(12)
    { recipe_id: 49, ingredient_id: 14, quantity: 2 },
    { recipe_id: 49, ingredient_id: 7, quantity: 1 },
    { recipe_id: 49, ingredient_id: 1, quantity: 2 },
    { recipe_id: 49, ingredient_id: 4, quantity: 1 },
    { recipe_id: 49, ingredient_id: 12, quantity: 1 },

    // 50. Poulet basquaise : Poulet(6) + Tomate(1) + Poivron(8) + Oignon(4) + Sel(12)
    { recipe_id: 50, ingredient_id: 6, quantity: 1 },
    { recipe_id: 50, ingredient_id: 1, quantity: 2 },
    { recipe_id: 50, ingredient_id: 8, quantity: 2 },
    { recipe_id: 50, ingredient_id: 4, quantity: 1 },
    { recipe_id: 50, ingredient_id: 12, quantity: 1 },
  ]);

  console.log('✅ Associations recettes-ingrédients créées');
  console.log('');
  console.log('🎉 Seed terminé avec succès !');
  console.log('   📦 20 ingrédients');
  console.log('   🍽️  50 recettes (10x⭐ / 15x⭐⭐ / 15x⭐⭐⭐ / 10x⭐⭐⭐⭐)');
  console.log('');
  console.log('   GUIDE DE DÉCOUVERTE RAPIDE (pour tester) :');
  console.log('   ⭐  Œuf(10) + Beurre(11)            → Œufs au beurre');
  console.log('   ⭐  Tomate(1) + Oignon(4)            → Salade tomate-oignon');
  console.log('   ⭐  Pâtes(14) + Beurre(11)           → Pâtes au beurre');
  console.log('   ⭐⭐ Œuf(10)+Beurre(11)+Sel(12)       → Omelette simple');
  console.log('   ⭐⭐ Pâtes(14)+Bacon(16)+Œuf(10)      → Carbonara simple');
  console.log('   ⭐⭐⭐ Bœuf(7)+Fromage(2)+Tomate(1)+Oignon(4) → Burger');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Erreur lors du seed:', error);
  process.exit(1);
});
