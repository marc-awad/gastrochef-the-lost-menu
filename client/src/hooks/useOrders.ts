import { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { getSocket } from '../services/socket';

interface Order {
  id: number;
  recipe_id: number;
  recipe_name: string;
  price: number;
  expires_at: string;
  is_vip: boolean;
  created_at?: string;
}

/**
 * 🎯 Hook personnalisé pour gérer les commandes
 *
 * Fonctionnalités:
 * - Récupération initiale des commandes
 * - Écoute WebSocket pour nouvelles commandes
 * - Écoute WebSocket pour commandes expirées
 * - Suppression locale d'une commande
 */
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 📥 Récupération initiale des commandes
   */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();

        if (response.success) {
          setOrders(response.data);
        }
      } catch (err: any) {
        console.error('❌ Erreur lors de la récupération des commandes:', err);
        setError(err.message || 'Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /**
   * 🔌 Écoute des événements WebSocket
   */
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      console.warn('⚠️ WebSocket non initialisé');
      return;
    }

    // 🆕 NOUVELLE COMMANDE
    const handleNewOrder = (newOrder: Order) => {
      console.log('🆕 Nouvelle commande reçue:', newOrder);

      setOrders((prevOrders) => {
        // Éviter les doublons
        const exists = prevOrders.some((order) => order.id === newOrder.id);
        if (exists) return prevOrders;

        // Ajouter la nouvelle commande en début de liste
        return [newOrder, ...prevOrders];
      });
    };

    // ⏰ COMMANDE EXPIRÉE
    const handleOrderExpired = (data: { orderId: number }) => {
      console.log('⏰ Commande expirée:', data.orderId);

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== data.orderId)
      );
    };

    // 📢 INSCRIPTION AUX ÉVÉNEMENTS
    socket.on('new_order', handleNewOrder);
    socket.on('order_expired', handleOrderExpired);

    // 🧹 NETTOYAGE
    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_expired', handleOrderExpired);
    };
  }, []);

  /**
   * 🗑️ Supprimer une commande localement (après service)
   */
  const removeOrder = (orderId: number) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  /**
   * 🔄 Rafraîchir manuellement les commandes
   */
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();

      if (response.success) {
        setOrders(response.data);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du rafraîchissement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    removeOrder,
    refreshOrders,
  };
};
