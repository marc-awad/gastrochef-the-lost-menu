import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useGame } from '../context/GameContext';
import type { Order, OrderWithTimer } from '../types/order';
import api from '../services/api';

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithTimer[]>([]);
  const [servingOrderId, setServingOrderId] = useState<number | null>(null);
  const { stats, updateStats, incrementServed, incrementFailed } = useGame();

  // Ajouter une nouvelle commande
  const addOrder = useCallback((order: Order) => {
    const expiresAt = new Date(order.expires_at).getTime();
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

    setOrders((prev) => [
      ...prev,
      {
        ...order,
        remainingSeconds,
      },
    ]);

    // Notification browser (si autorisée)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouvelle commande !', {
        body: `${order.recipe_name} - ${order.price}€${order.is_vip ? ' (VIP)' : ''}`,
        icon: order.is_vip ? '⭐' : '🍽️',
      });
    }
  }, []);

  // Retirer une commande
  const removeOrder = useCallback((orderId: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  // Servir une commande
  const serveOrder = useCallback(
    async (orderId: number): Promise<boolean> => {
      setServingOrderId(orderId);

      try {
        const response = await api.post('/orders/serve', { orderId });

        if (response.data.success) {
          removeOrder(orderId);
          incrementServed();

          // Mettre à jour la satisfaction
          if (response.data.data?.satisfaction !== undefined) {
            updateStats({ satisfaction: response.data.data.satisfaction });
          }

          return true;
        }

        return false;
      } catch (error: any) {
        console.error('❌ Erreur lors du service:', error);
        alert(
          error.response?.data?.message || 'Impossible de servir cette commande'
        );
        return false;
      } finally {
        setServingOrderId(null);
      }
    },
    [removeOrder, incrementServed, updateStats]
  );

  // Écouter les nouvelles commandes via WebSocket
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      console.warn('⚠️ Socket non connecté dans useOrders');
      return;
    }

    socket.on('new_order', addOrder);

    socket.on('order_expired', (data: { id: number; recipe_name: string }) => {
      removeOrder(data.id);
      incrementFailed();
    });

    return () => {
      socket.off('new_order', addOrder);
      socket.off('order_expired');
    };
  }, [addOrder, removeOrder, incrementFailed]);

  // Timer pour décrémenter les secondes restantes
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const updated = prev
          .map((order) => ({
            ...order,
            remainingSeconds: Math.max(0, order.remainingSeconds - 1),
          }))
          .filter((order) => order.remainingSeconds > 0);

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    orders,
    servingOrderId,
    stats,
    serveOrder,
  };
}
