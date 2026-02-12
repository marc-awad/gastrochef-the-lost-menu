import { Server } from 'socket.io';
import { Op } from 'sequelize';
import { Order } from '../models/Order';
import { Recipe } from '../models/Recipe';
import { UserDiscoveredRecipe } from '../models/UserDiscoveredRecipe';
import { User } from '../models/User';

// ─── Config ───────────────────────────────────────────────────
const CONFIG = {
  ORDER_INTERVAL_MIN_MS: 15_000, // 15s  → intervalle min entre commandes
  ORDER_INTERVAL_MAX_MS: 30_000, // 30s  → intervalle max
  EXPIRY_MIN_S: 30, // 30s  → durée de vie min d'une commande
  EXPIRY_MAX_S: 60, // 60s  → durée de vie max
  EXPIRY_CHECK_MS: 5_000, // 5s   → fréquence du cron d'expiration
  VIP_PROBABILITY: 0.15, // 15%  → chance d'avoir une commande VIP
};

// ─── Helpers ──────────────────────────────────────────────────
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randMs = () =>
  rand(CONFIG.ORDER_INTERVAL_MIN_MS, CONFIG.ORDER_INTERVAL_MAX_MS);

const expiresAt = () => {
  const seconds = rand(CONFIG.EXPIRY_MIN_S, CONFIG.EXPIRY_MAX_S);
  return new Date(Date.now() + seconds * 1000);
};

// ─── Génération d'une commande pour un utilisateur ────────────
const generateOrderForUser = async (
  io: Server,
  userId: number
): Promise<void> => {
  try {
    // 1. Récupérer les recettes découvertes par cet utilisateur
    const discovered = await UserDiscoveredRecipe.findAll({
      where: { user_id: userId },
    });

    if (discovered.length === 0) {
      console.log(
        `⚠️  [ORDERS] userId=${userId} : aucune recette découverte, pas de commande`
      );
      return;
    }

    // 2. Choisir une recette au hasard parmi les découvertes
    const randomEntry = discovered[rand(0, discovered.length - 1)];
    const recipe = await Recipe.findByPk(randomEntry.recipe_id);

    if (!recipe) return;

    // 3. Calculer le prix (VIP = bonus x1.5)
    const isVip = Math.random() < CONFIG.VIP_PROBABILITY;
    const price = isVip
      ? parseFloat(String(recipe.sale_price)) * 1.5
      : parseFloat(String(recipe.sale_price));

    // 4. Créer la commande en base
    const order = await Order.create({
      user_id: userId,
      recipe_id: recipe.id,
      status: 'pending',
      price: Math.round(price * 100) / 100,
      expires_at: expiresAt(),
      is_vip: isVip,
    });

    const payload = {
      id: order.id,
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      price: order.price,
      expires_at: order.expires_at,
      is_vip: isVip,
      created_at: order.created_at,
    };

    // 5. Émettre dans la room du joueur
    io.to(`user:${userId}`).emit('new_order', payload);

    console.log(
      `📦 [NEW ORDER] id=${order.id} | userId=${userId} | recette="${recipe.name}" | prix=${order.price}€ | VIP=${isVip} | expire dans ~${CONFIG.EXPIRY_MIN_S}-${CONFIG.EXPIRY_MAX_S}s`
    );
  } catch (err) {
    console.error(
      `❌ [ORDERS] Erreur génération commande userId=${userId}:`,
      (err as Error).message
    );
  }
};

// ─── Cron : expiration des commandes périmées ─────────────────
const startExpiryWatcher = (io: Server): NodeJS.Timeout => {
  return setInterval(async () => {
    try {
      const expired = await Order.findAll({
        where: {
          status: 'pending',
          expires_at: { [Op.lt]: new Date() },
        },
        include: [{ model: Recipe, as: 'recipe' }],
      });

      for (const order of expired) {
        await order.update({ status: 'expired' });

        const payload = {
          id: order.id,
          recipe_id: order.recipe_id,
          recipe_name: (order as any).recipe?.name ?? 'Inconnue',
        };

        io.to(`user:${order.user_id}`).emit('order_expired', payload);

        console.log(
          `⏰ [EXPIRED] orderId=${order.id} | userId=${order.user_id} | recette="${payload.recipe_name}"`
        );
      }
    } catch (err) {
      console.error('❌ [EXPIRY WATCHER] Erreur:', (err as Error).message);
    }
  }, CONFIG.EXPIRY_CHECK_MS);
};

// ─── Registre des intervals par userId ───────────────────────
const orderIntervals = new Map<number, NodeJS.Timeout>();

// ─── Démarrer la génération pour un utilisateur ───────────────
export const startOrderGeneratorForUser = (
  io: Server,
  userId: number
): void => {
  if (orderIntervals.has(userId)) {
    console.log(`⚠️  [ORDERS] Générateur déjà actif pour userId=${userId}`);
    return;
  }

  console.log(`🚀 [ORDERS] Démarrage générateur pour userId=${userId}`);

  // Planifie récursivement avec un délai aléatoire
  const scheduleNext = () => {
    const delay = randMs();
    console.log(
      `⏱  [ORDERS] Prochaine commande pour userId=${userId} dans ${delay / 1000}s`
    );

    const timeout = setTimeout(async () => {
      await generateOrderForUser(io, userId);
      // Seulement si le joueur est toujours connecté
      if (orderIntervals.has(userId)) scheduleNext();
    }, delay);

    orderIntervals.set(userId, timeout);
  };

  scheduleNext();
};

// ─── Arrêter la génération pour un utilisateur ───────────────
export const stopOrderGeneratorForUser = (userId: number): void => {
  const timeout = orderIntervals.get(userId);
  if (timeout) {
    clearTimeout(timeout);
    orderIntervals.delete(userId);
    console.log(`🛑 [ORDERS] Générateur arrêté pour userId=${userId}`);
  }
};

// ─── Init globale : watcher d'expiration + hook sur socket ───
export const initOrderSystem = (io: Server): void => {
  // Lance le cron d'expiration une seule fois
  startExpiryWatcher(io);
  console.log(
    `✅ [ORDERS] Système de commandes initialisé (expiry check toutes les ${CONFIG.EXPIRY_CHECK_MS / 1000}s)`
  );
};
