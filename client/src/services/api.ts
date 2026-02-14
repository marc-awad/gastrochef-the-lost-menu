// client/src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTEUR : Ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      // Ajouter le header Authorization avec Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      console.error('❌ Non authentifié - Redirection vers login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// 🆕 TYPES POUR LES COMMANDES
// ========================================

export interface ServeOrderResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: number;
    satisfaction: number;
    recipeName: string;
    isVip: boolean;
    satisfactionBonus: number;
    gameOver: boolean; // ✅ NOUVEAU : Ajout du flag gameOver
  };
}

export interface GetOrdersResponse {
  success: boolean;
  data: Array<{
    id: number;
    recipe_id: number;
    recipe_name: string;
    price: number;
    expires_at: string;
    is_vip: boolean;
    created_at?: string;
  }>;
}

// ========================================
// 🆕 FONCTIONS API POUR LES COMMANDES
// ========================================

/**
 * 🍽️ Servir une commande
 *
 * @param orderId - ID de la commande à servir
 * @returns Réponse avec le nouveau score de satisfaction
 */
export const serveOrder = async (
  orderId: number
): Promise<ServeOrderResponse> => {
  try {
    const response = await api.post<ServeOrderResponse>(
      `/orders/serve/${orderId}`
    );
    return response.data;
  } catch (error: any) {
    // Extraire le message d'erreur du serveur
    const errorMessage =
      error.response?.data?.message || 'Erreur lors du service de la commande';

    // Vérifier si c'est un Game Over
    const gameOver = error.response?.data?.data?.gameOver || false;

    throw {
      message: errorMessage,
      gameOver,
      satisfaction: error.response?.data?.data?.satisfaction,
    };
  }
};

/**
 * 📋 Récupérer toutes les commandes en attente
 *
 * @returns Liste des commandes de l'utilisateur
 */
export const getOrders = async (): Promise<GetOrdersResponse> => {
  try {
    const response = await api.get<GetOrdersResponse>('/orders');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        'Erreur lors de la récupération des commandes'
    );
  }
};

/**
 * 🗑️ Nettoyer les commandes expirées
 *
 * @returns Résultat du nettoyage
 */
export const cleanupExpiredOrders = async (): Promise<any> => {
  try {
    const response = await api.post('/orders/cleanup-expired');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Erreur lors du nettoyage'
    );
  }
};

// ========================================
// 🛒 TYPES MARKETPLACE / INVENTORY
// ========================================

export interface BuyIngredientResponse {
  success: boolean;
  message: string;
  data: {
    ingredientName: string;
    quantity: number;
    totalCost: number;
    newTreasury: number;
  };
}

export interface InventoryItem {
  id: number;
  ingredient_id: number;
  quantity: number;
  purchased_at: string;
  ingredient: {
    id: number;
    name: string;
    price: number;
  };
}

export interface GetInventoryResponse {
  success: boolean;
  data: InventoryItem[];
}

// ========================================
// 🛒 FONCTIONS API MARKETPLACE
// ========================================

/**
 * 🛒 Acheter des ingrédients
 *
 * @param ingredientId - ID de l'ingrédient à acheter
 * @param quantity - Quantité souhaitée
 */
export const buyIngredient = async (
  ingredientId: number,
  quantity: number
): Promise<BuyIngredientResponse> => {
  try {
    const response = await api.post<BuyIngredientResponse>('/marketplace/buy', {
      ingredientId,
      quantity,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de l'achat");
  }
};

/**
 * 📦 Récupérer l'inventaire du joueur
 *
 * @returns Liste des ingrédients en stock avec leurs quantités
 */
export const getInventory = async (): Promise<GetInventoryResponse> => {
  try {
    const response = await api.get<GetInventoryResponse>('/inventory');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de l'inventaire"
    );
  }
};

export default api;
