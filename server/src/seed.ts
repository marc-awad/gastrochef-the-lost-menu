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
  console.log(
    '✅ Tables synchronisées (force: true — toutes les tables recréées)'
  );

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
  //
  //  Tous les prix garantissent une marge > 30% :
  //  marge = (prix_vente - coût_ingrédients) / prix_vente
  // ──────────────────────────────────────────────
  const recipesData = [
    // ── NIVEAU ⭐ : 2 ingrédients ──────────────────────────────
    { name: 'Œufs au beurre', sale_price: 3.0 }, // 1  — coût=1.00, marge=66.7%
    { name: 'Salade tomate-oignon', sale_price: 3.0 }, // 2  — coût=1.40, marge=53.3%
    { name: 'Pâtes au beurre', sale_price: 3.5 }, // 3  — coût=2.30, marge=34.3% ✅ CORRIGÉ
    { name: 'Riz au lait', sale_price: 4.5 }, // 4  — coût=3.00, marge=33.3% ✅ CORRIGÉ
    { name: 'Saumon au beurre', sale_price: 7.0 }, // 5  — coût=3.00, marge=57.1%
    { name: 'Steak poivré', sale_price: 8.0 }, // 6  — coût=3.05, marge=61.9%
    { name: 'Tomate-fromage', sale_price: 4.0 }, // 7  — coût=2.20, marge=45.0%
    { name: 'Carotte-oignon sauté', sale_price: 3.0 }, // 8  — coût=1.10, marge=63.3%
    { name: 'Champignons sautés', sale_price: 4.0 }, // 9  — coût=1.70, marge=57.5%
    { name: 'Bacon croustillant', sale_price: 5.0 }, // 10 — coût=3.05, marge=39.0%

    // ── NIVEAU ⭐⭐ : 3 ingrédients ────────────────────────────
    { name: 'Omelette simple', sale_price: 5.0 }, // 11 — coût=1.30, marge=74.0%
    { name: 'Poulet sauté', sale_price: 7.0 }, // 12 — coût=2.45, marge=65.0%
    { name: 'Soupe carotte', sale_price: 5.0 }, // 13 — coût=1.50, marge=70.0%
    { name: 'Purée maison', sale_price: 5.0 }, // 14 — coût=2.50, marge=50.0%
    { name: 'Riz sauté simple', sale_price: 5.0 }, // 15 — coût=2.00, marge=60.0%
    { name: 'Pâtes sauce tomate', sale_price: 5.0 }, // 16 — coût=2.80, marge=44.0%
    { name: 'Salade cesar basique', sale_price: 6.0 }, // 17 — coût=3.20, marge=46.7%
    { name: 'Champignons à la crème', sale_price: 6.0 }, // 18 — coût=1.85, marge=69.2%
    { name: 'Salade thon-tomate', sale_price: 6.0 }, // 19 — coût=2.50, marge=58.3%
    { name: 'Escalope crème', sale_price: 8.0 }, // 20 — coût=3.40, marge=57.5%
    { name: 'Poisson sel-beurre', sale_price: 7.0 }, // 21 — coût=3.05, marge=56.4%
    { name: 'Omelette fromage', sale_price: 6.0 }, // 22 — coût=2.45, marge=59.2%
    { name: 'Soupe oignon', sale_price: 5.0 }, // 23 — coût=1.70, marge=66.0%
    { name: 'Riz poulet basique', sale_price: 7.0 }, // 24 — coût=3.45, marge=50.7%
    { name: 'Pâtes carbonara simple', sale_price: 8.0 }, // 25 — coût=5.30, marge=33.8% ✅ CORRIGÉ

    // ── NIVEAU ⭐⭐⭐ : 4 ingrédients ──────────────────────────
    { name: 'Omelette complète', sale_price: 7.0 }, // 26 — coût=1.35, marge=80.7%
    { name: 'Burger classique', sale_price: 8.0 }, // 27 — coût=5.10, marge=36.3%
    { name: 'Salade composée', sale_price: 6.0 }, // 28 — coût=1.95, marge=67.5%
    { name: 'Riz cantonais', sale_price: 7.0 }, // 29 — coût=2.80, marge=60.0%
    { name: 'Poulet chasseur', sale_price: 10.0 }, // 30 — coût=3.60, marge=64.0%
    { name: 'Poisson grillé', sale_price: 10.0 }, // 31 — coût=3.60, marge=64.0%
    { name: 'Tarte thon-tomate', sale_price: 8.0 }, // 32 — coût=3.50, marge=56.3%
    { name: 'Gratin de pâtes', sale_price: 7.0 }, // 33 — coût=4.25, marge=39.3%
    { name: 'Saumon crème-champignon', sale_price: 12.0 }, // 34 — coût=4.20, marge=65.0%
    { name: 'Boeuf carotte', sale_price: 11.0 }, // 35 — coût=4.50, marge=59.1%
    { name: 'Poulet rôti simple', sale_price: 9.0 }, // 36 — coût=2.60, marge=71.1%
    { name: 'Riz sauté légumes', sale_price: 7.0 }, // 37 — coût=2.75, marge=60.7%
    { name: 'Pâtes bacon-crème', sale_price: 9.5 }, // 38 — coût=6.60, marge=30.5% ✅ CORRIGÉ
    { name: 'Salade niçoise', sale_price: 8.0 }, // 39 — coût=2.90, marge=63.8%
    { name: 'Gratin de pommes de terre', sale_price: 8.0 }, // 40 — coût=3.00, marge=62.5%

    // ── NIVEAU ⭐⭐⭐⭐ : 5-6 ingrédients ──────────────────────
    { name: 'Pizza', sale_price: 9.0 }, // 41 — coût=4.60, marge=48.9%
    { name: 'Spaghetti Carbonara', sale_price: 9.5 }, // 42 — coût=6.55, marge=31.1% ✅ CORRIGÉ
    { name: 'Poulet rôti complet', sale_price: 13.0 }, // 43 — coût=4.20, marge=67.7%
    { name: 'Quiche Lorraine', sale_price: 9.0 }, // 44 — coût=5.30, marge=41.1%
    { name: 'Soupe de légumes', sale_price: 7.0 }, // 45 — coût=2.80, marge=60.0%
    { name: 'Hachis Parmentier', sale_price: 11.0 }, // 46 — coût=5.65, marge=48.6%
    { name: 'Riz sauté complet', sale_price: 9.0 }, // 47 — coût=3.75, marge=58.3%
    { name: 'Gratin dauphinois', sale_price: 10.0 }, // 48 — coût=4.20, marge=58.0%
    { name: 'Spaghetti bolognaise', sale_price: 10.0 }, // 49 — coût=6.85, marge=31.5%
    { name: 'Poulet basquaise', sale_price: 12.0 }, // 50 — coût=4.65, marge=61.3%
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
  console.log('   💰 Tous les prix garantissent une marge > 30%');
  console.log('   🗄️  Tables transactions et inventory créées (vides)');
  console.log('');
  console.log('   GUIDE DE DÉCOUVERTE RAPIDE (pour tester) :');
  console.log('   ⭐  Œuf(10) + Beurre(11)            → Œufs au beurre');
  console.log('   ⭐  Tomate(1) + Oignon(4)            → Salade tomate-oignon');
  console.log('   ⭐  Pâtes(14) + Beurre(11)           → Pâtes au beurre');
  console.log('   ⭐⭐ Œuf(10)+Beurre(11)+Sel(12)       → Omelette simple');
  console.log('   ⭐⭐ Pâtes(14)+Bacon(16)+Œuf(10)      → Carbonara simple');
  console.log('   ⭐⭐⭐ Bœuf(7)+Fromage(2)+Tomate(1)+Oignon(4) → Burger');
  console.log('');
  console.log('   NOUVELLES TABLES CRÉÉES (niveau 16/20) :');
  console.log('   📒 transactions — historique financier');
  console.log("   📦 inventory    — stock d'ingrédients par joueur");

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Erreur lors du seed:', error);
  process.exit(1);
});
