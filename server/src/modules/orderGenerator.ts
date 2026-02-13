import { Server } from 'socket.io';
import { Op } from 'sequelize';
import { Order } from '../models/Order';
import { Recipe } from '../models/Recipe';
import { UserDiscoveredRecipe } from '../models/UserDiscoveredRecipe';
import { User } from '../models/User';
import sequelize from '../config/db';

const CONFIG = {
  ORDER_INTERVAL_MIN_MS: 15_000,
  ORDER_INTERVAL_MAX_MS: 30_000,
  EXPIRY_MIN_S: 30,
  EXPIRY_MAX_S: 60,
  EXPIRY_CHECK_MS: 5_000,
  VIP_PROBABILITY: 0.15,
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randMs = () =>
  rand(CONFIG.ORDER_INTERVAL_MIN_MS, CONFIG.ORDER_INTERVAL_MAX_MS);
const expiresAt = () =>
  new Date(Date.now() + rand(CONFIG.EXPIRY_MIN_S, CONFIG.EXPIRY_MAX_S) * 1000);

const generateOrderForUser = async (
  io: Server,
  userId: number
): Promise<void> => {
  try {
    const discovered = await UserDiscoveredRecipe.findAll({
      where: { user_id: userId },
    });
    if (discovered.length === 0) return;

    const randomEntry = discovered[rand(0, discovered.length - 1)];
    const recipe = await Recipe.findByPk(randomEntry.recipe_id);
    if (!recipe) return;

    const isVip = Math.random() < CONFIG.VIP_PROBABILITY;
    const price = isVip
      ? parseFloat(String(recipe.sale_price)) * 1.5
      : parseFloat(String(recipe.sale_price));

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

    // ✅ ROOM DEBUG : afficher exactement dans quelle room on émet
    const room = `user:${userId}`;
    console.log(
      `📦 [NEW ORDER] id=${order.id} | room="${room}" | recette="${recipe.name}"`
    );
    io.to(room).emit('new_order', payload);
  } catch (err) {
    console.error(
      `❌ [ORDERS] Erreur génération userId=${userId}:`,
      (err as Error).message
    );
  }
};

// ─── Expiry watcher ───────────────────────────────────────────
let expiryWatcherCount = 0; // ✅ DEBUG : détecter les instances multiples

const startExpiryWatcher = (io: Server): NodeJS.Timeout => {
  expiryWatcherCount++;
  console.log(
    `⚠️  [EXPIRY] startExpiryWatcher appelé — instance #${expiryWatcherCount}`
  );
  if (expiryWatcherCount > 1) {
    console.error(`🚨 [EXPIRY] PLUSIEURS INSTANCES DÉTECTÉES ! C'est le bug.`);
  }

  return setInterval(async () => {
    try {
      const expired = await Order.findAll({
        where: { status: 'pending', expires_at: { [Op.lt]: new Date() } },
        include: [{ model: Recipe, as: 'recipe' }],
      });

      if (expired.length > 0) {
        console.log(
          `⏰ [EXPIRY] ${expired.length} commande(s) expirée(s) trouvée(s)`
        );
      }

      for (const order of expired) {
        const transaction = await sequelize.transaction();
        try {
          await order.update({ status: 'expired' }, { transaction });

          const user = await User.findByPk(order.user_id, { transaction });
          if (!user) {
            await transaction.rollback();
            continue;
          }

          const penalty = order.is_vip ? 20 : 10;
          const newSatisfaction = user.satisfaction - penalty;

          console.log(
            `⏰ [EXPIRY] orderId=${order.id} | userId=${order.user_id} | satisfaction: ${user.satisfaction} → ${newSatisfaction} (pénalité=${penalty})`
          );

          await user.update({ satisfaction: newSatisfaction }, { transaction });
          await transaction.commit();

          const room = `user:${order.user_id}`;
          console.log(
            `📡 [EXPIRY] Émission order_expired + stats_update dans room="${room}"`
          );

          io.to(room).emit('order_expired', { orderId: order.id });
          io.to(room).emit('stats_update', { satisfaction: newSatisfaction });

          if (newSatisfaction < 0) {
            console.log(`💀 [EXPIRY] GAME OVER userId=${order.user_id}`);
            io.to(room).emit('game_over', {
              reason: 'satisfaction',
              satisfaction: newSatisfaction,
            });
          }
        } catch (err) {
          await transaction.rollback();
          console.error(
            `❌ [EXPIRY] Erreur orderId=${order.id}:`,
            (err as Error).message
          );
        }
      }
    } catch (err) {
      console.error('❌ [EXPIRY WATCHER] Erreur:', (err as Error).message);
    }
  }, CONFIG.EXPIRY_CHECK_MS);
};

const orderIntervals = new Map<number, NodeJS.Timeout>();
const connectedSockets = new Map<number, number>();

export const startOrderGeneratorForUser = (
  io: Server,
  userId: number
): void => {
  const count = (connectedSockets.get(userId) ?? 0) + 1;
  connectedSockets.set(userId, count);
  console.log(`🔌 [ORDERS] userId=${userId} — sockets connectés: ${count}`);

  if (orderIntervals.has(userId)) {
    console.log(`⚠️  [ORDERS] Générateur déjà actif pour userId=${userId}`);
    return;
  }

  console.log(`🚀 [ORDERS] Démarrage générateur pour userId=${userId}`);

  const scheduleNext = () => {
    const delay = randMs();
    const timeout = setTimeout(async () => {
      await generateOrderForUser(io, userId);
      if (orderIntervals.has(userId)) scheduleNext();
    }, delay);
    orderIntervals.set(userId, timeout);
  };

  scheduleNext();
};

export const stopOrderGeneratorForUser = (userId: number): void => {
  const count = connectedSockets.get(userId) ?? 0;
  const newCount = Math.max(0, count - 1);
  connectedSockets.set(userId, newCount);
  console.log(`🔌 [ORDERS] userId=${userId} — sockets restants: ${newCount}`);

  if (newCount > 0) return;

  const timeout = orderIntervals.get(userId);
  if (timeout) {
    clearTimeout(timeout);
    orderIntervals.delete(userId);
    connectedSockets.delete(userId);
    console.log(`🛑 [ORDERS] Générateur arrêté pour userId=${userId}`);
  }
};

export const initOrderSystem = (io: Server): void => {
  startExpiryWatcher(io);
  console.log(`✅ [ORDERS] Système initialisé`);
};
