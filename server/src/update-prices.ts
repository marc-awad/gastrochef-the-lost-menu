/**
 * update-prices.ts
 *
 * Script standalone pour mettre à jour les prix des ingrédients et recettes
 * sans relancer le seed complet (pas de DROP TABLE).
 *
 * Usage :
 *   cd server && npx ts-node src/update-prices.ts
 *
 * Ce script :
 *  1. Met à jour les prix d'achat des 20 ingrédients
 *  2. Corrige les prix de vente des recettes pour garantir une marge > 30%
 *  3. Affiche un rapport de marge pour toutes les recettes
 */

import sequelize from './config/db';
import './models'; // Charge les modèles et associations
import { Ingredient, Recipe } from './models';

// ──────────────────────────────────────────────────────────────────
//  PRIX D'ACHAT DES INGRÉDIENTS (range : 0.05 → 3.00)
//  Cohérent avec le seed existant — pas de changement sur les prix
//  d'achat car ils impactent le coût de revient des recettes.
// ──────────────────────────────────────────────────────────────────
const INGREDIENT_PRICES: Record<number, number> = {
  1: 0.5, // Tomate
  2: 1.2, // Fromage
  3: 0.3, // Pomme de terre
  4: 0.4, // Oignon
  5: 0.35, // Carotte
  6: 2.0, // Poulet
  7: 3.0, // Boeuf
  8: 0.6, // Poivron
  9: 0.8, // Lait
  10: 0.25, // Œuf
  11: 0.5, // Beurre
  12: 0.05, // Sel
  13: 0.05, // Poivre
  14: 0.9, // Pâtes
  15: 0.7, // Riz
  16: 1.5, // Bacon
  17: 0.6, // Crème
  18: 0.4, // Champignon
  19: 1.3, // Thon
  20: 2.5, // Saumon
};

// ──────────────────────────────────────────────────────────────────
//  PRIX DE VENTE CORRIGÉS DES RECETTES
//
//  Règle : marge = (prix_vente - coût) / prix_vente >= 30%
//  Soit : prix_vente >= coût / 0.70
//
//  Corrections appliquées (seules les recettes sous 30%) :
//  - id=3  Pâtes au beurre        : 3.00 → 3.50  (coût=2.30, marge=34.3%)
//  - id=4  Riz au lait            : 3.00 → 4.50  (coût=3.00, marge=33.3%)
//  - id=25 Pâtes carbonara simple : 6.00 → 7.50  (coût=5.30, marge=29.3% → 8.00 pour dépasser 30%)
//  - id=38 Pâtes bacon-crème      : 8.00 → 9.50  (coût=6.60, marge=30.5%)
//  - id=42 Spaghetti Carbonara    : 9.00 → 9.50  (coût=6.55, marge=31.1%)
// ──────────────────────────────────────────────────────────────────
const RECIPE_PRICES: Record<number, number> = {
  1: 3.0, // Œufs au beurre          — coût=1.00, marge=66.7%
  2: 3.0, // Salade tomate-oignon    — coût=1.40, marge=53.3%
  3: 3.5, // Pâtes au beurre         — coût=2.30, marge=34.3% ✅ CORRIGÉ
  4: 4.5, // Riz au lait             — coût=3.00, marge=33.3% ✅ CORRIGÉ
  5: 7.0, // Saumon au beurre        — coût=3.00, marge=57.1%
  6: 8.0, // Steak poivré            — coût=3.05, marge=61.9%
  7: 4.0, // Tomate-fromage          — coût=2.20, marge=45.0%
  8: 3.0, // Carotte-oignon sauté    — coût=1.10, marge=63.3%
  9: 4.0, // Champignons sautés      — coût=1.70, marge=57.5%
  10: 5.0, // Bacon croustillant      — coût=3.05, marge=39.0%
  11: 5.0, // Omelette simple         — coût=1.30, marge=74.0%
  12: 7.0, // Poulet sauté            — coût=2.45, marge=65.0%
  13: 5.0, // Soupe carotte           — coût=1.50, marge=70.0%
  14: 5.0, // Purée maison            — coût=2.50, marge=50.0%
  15: 5.0, // Riz sauté simple        — coût=2.00, marge=60.0%
  16: 5.0, // Pâtes sauce tomate      — coût=2.80, marge=44.0%
  17: 6.0, // Salade cesar basique    — coût=3.20, marge=46.7%
  18: 6.0, // Champignons à la crème  — coût=1.85, marge=69.2%
  19: 6.0, // Salade thon-tomate      — coût=2.50, marge=58.3%
  20: 8.0, // Escalope crème          — coût=3.40, marge=57.5%
  21: 7.0, // Poisson sel-beurre      — coût=3.05, marge=56.4%
  22: 6.0, // Omelette fromage        — coût=2.45, marge=59.2%
  23: 5.0, // Soupe oignon            — coût=1.70, marge=66.0%
  24: 7.0, // Riz poulet basique      — coût=3.45, marge=50.7%
  25: 8.0, // Pâtes carbonara simple  — coût=5.30, marge=33.8% ✅ CORRIGÉ
  26: 7.0, // Omelette complète       — coût=1.35, marge=80.7%
  27: 8.0, // Burger classique        — coût=5.10, marge=36.3%
  28: 6.0, // Salade composée         — coût=1.95, marge=67.5%
  29: 7.0, // Riz cantonais           — coût=2.80, marge=60.0%
  30: 10.0, // Poulet chasseur         — coût=3.60, marge=64.0%
  31: 10.0, // Poisson grillé          — coût=3.60, marge=64.0%
  32: 8.0, // Tarte thon-tomate       — coût=3.50, marge=56.3%
  33: 7.0, // Gratin de pâtes         — coût=4.25, marge=39.3%
  34: 12.0, // Saumon crème-champignon — coût=4.20, marge=65.0%
  35: 11.0, // Boeuf carotte           — coût=4.50, marge=59.1%
  36: 9.0, // Poulet rôti simple      — coût=2.60, marge=71.1%
  37: 7.0, // Riz sauté légumes       — coût=2.75, marge=60.7%
  38: 9.5, // Pâtes bacon-crème       — coût=6.60, marge=30.5% ✅ CORRIGÉ
  39: 8.0, // Salade niçoise          — coût=2.90, marge=63.8%
  40: 8.0, // Gratin pommes de terre  — coût=3.00, marge=62.5%
  41: 9.0, // Pizza                   — coût=4.60, marge=48.9%
  42: 9.5, // Spaghetti Carbonara     — coût=6.55, marge=31.1% ✅ CORRIGÉ
  43: 13.0, // Poulet rôti complet     — coût=4.20, marge=67.7%
  44: 9.0, // Quiche Lorraine         — coût=5.30, marge=41.1%
  45: 7.0, // Soupe de légumes        — coût=2.80, marge=60.0%
  46: 11.0, // Hachis Parmentier       — coût=5.65, marge=48.6%
  47: 9.0, // Riz sauté complet       — coût=3.75, marge=58.3%
  48: 10.0, // Gratin dauphinois       — coût=4.20, marge=58.0%
  49: 10.0, // Spaghetti bolognaise    — coût=6.85, marge=31.5%
  50: 12.0, // Poulet basquaise        — coût=4.65, marge=61.3%
};

async function updatePrices() {
  await sequelize.authenticate();
  console.log('✅ Connexion BDD établie\n');

  // ── 1. Mise à jour des prix des ingrédients ──────────────────
  console.log('📦 Mise à jour des prix des ingrédients...');
  let ingredientUpdates = 0;

  for (const [idStr, price] of Object.entries(INGREDIENT_PRICES)) {
    const id = parseInt(idStr);
    const [rows] = await Ingredient.update({ price }, { where: { id } });
    if (rows > 0) ingredientUpdates++;
  }

  console.log(`   → ${ingredientUpdates} ingrédient(s) mis à jour\n`);

  // ── 2. Mise à jour des prix de vente des recettes ────────────
  console.log('🍽️  Mise à jour des prix de vente des recettes...');
  let recipeUpdates = 0;

  for (const [idStr, sale_price] of Object.entries(RECIPE_PRICES)) {
    const id = parseInt(idStr);
    const [rows] = await Recipe.update({ sale_price }, { where: { id } });
    if (rows > 0) recipeUpdates++;
  }

  console.log(`   → ${recipeUpdates} recette(s) mise(s) à jour\n`);

  // ── 3. Rapport de marge ───────────────────────────────────────
  console.log('📊 Rapport de marge (toutes recettes) :');
  console.log('─'.repeat(70));

  const RECIPE_COSTS: Record<number, number> = {
    1: 1.0,
    2: 1.4,
    3: 2.3,
    4: 3.0,
    5: 3.0,
    6: 3.05,
    7: 2.2,
    8: 1.1,
    9: 1.7,
    10: 3.05,
    11: 1.3,
    12: 2.45,
    13: 1.5,
    14: 2.5,
    15: 2.0,
    16: 2.8,
    17: 3.2,
    18: 1.85,
    19: 2.5,
    20: 3.4,
    21: 3.05,
    22: 2.45,
    23: 1.7,
    24: 3.45,
    25: 5.3,
    26: 1.35,
    27: 5.1,
    28: 1.95,
    29: 2.8,
    30: 3.6,
    31: 3.6,
    32: 3.5,
    33: 4.25,
    34: 4.2,
    35: 4.5,
    36: 2.6,
    37: 2.75,
    38: 6.6,
    39: 2.9,
    40: 3.0,
    41: 4.6,
    42: 6.55,
    43: 4.2,
    44: 5.3,
    45: 2.8,
    46: 5.65,
    47: 3.75,
    48: 4.2,
    49: 6.85,
    50: 4.65,
  };

  let allOk = true;
  for (const [idStr, sale_price] of Object.entries(RECIPE_PRICES)) {
    const id = parseInt(idStr);
    const cost = RECIPE_COSTS[id] ?? 0;
    const margin = ((sale_price - cost) / sale_price) * 100;
    const ok = margin >= 30;
    if (!ok) allOk = false;
    const icon = ok ? '✅' : '❌';
    console.log(
      `${icon} id=${String(id).padStart(2)} ` +
        `prix=${String(sale_price).padStart(5)}€  ` +
        `coût=${cost.toFixed(2).padStart(5)}€  ` +
        `marge=${margin.toFixed(1).padStart(5)}%`
    );
  }

  console.log('─'.repeat(70));
  if (allOk) {
    console.log('✅ Toutes les recettes ont une marge > 30%\n');
  } else {
    console.log('❌ Certaines recettes sont sous la marge cible de 30%\n');
  }

  console.log('🎉 Mise à jour des prix terminée !');
  process.exit(0);
}

updatePrices().catch((err) => {
  console.error('❌ Erreur lors de la mise à jour des prix :', err);
  process.exit(1);
});
