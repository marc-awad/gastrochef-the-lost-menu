import { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { getSocket } from '../services/socket';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: number;
  recipe_id: number;
  recipe_name: string;
  price: number;
  expires_at: string;
  is_vip: boolean;
  created_at?: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { incrementFailed } = useGame();
  const { token } = useAuth();

  // Récupération initiale
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        if (response.success) setOrders(response.data);
      } catch (err: any) {
        console.error('❌ Erreur lors de la récupération des commandes:', err);
        setError(err.message || 'Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Listeners WebSocket
  useEffect(() => {
    if (!token) return;

    // Petit délai pour s'assurer que le socket est prêt (initialisé dans AuthContext)
    const timeout = setTimeout(() => {
      const socket = getSocket();
      if (!socket) {
        console.warn('⚠️ WebSocket non initialisé dans useOrders');
        return;
      }

      // 🆕 Nouvelle commande → ajout dans l'UI
      const handleNewOrder = (newOrder: Order) => {
        console.log('🆕 Nouvelle commande reçue:', newOrder);
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      };

      // ⏰ Commande expirée → suppression visuelle + compteur
      // ✅ PAS de décrémentation de satisfaction ici
      // La satisfaction arrive du serveur via stats_update dans GameContext
      const handleOrderExpired = (data: {
        orderId: number;
        satisfaction?: number;
        penalty?: number;
      }) => {
        console.log('⏰ Commande expirée reçue via WebSocket:', data);
        setOrders((prev) => prev.filter((o) => o.id !== data.orderId));
        incrementFailed(); // compteur visuel seulement (failedOrders + 1)
      };

      socket.off('new_order');
      socket.off('order_expired');
      socket.on('new_order', handleNewOrder);
      socket.on('order_expired', handleOrderExpired);
    }, 150);

    return () => {
      clearTimeout(timeout);
      const socket = getSocket();
      if (socket) {
        socket.off('new_order');
        socket.off('order_expired');
      }
    };
  }, [token]); // ✅ Dépend du token, pas de incrementFailed (évite les re-subscriptions)

  const removeOrder = (orderId: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      if (response.success) setOrders(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, removeOrder, refreshOrders };
};
