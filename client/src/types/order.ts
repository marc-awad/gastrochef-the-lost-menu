// Types pour les commandes
export interface Order {
  id: number;
  recipe_id: number;
  recipe_name: string;
  price: number;
  expires_at: string;
  is_vip: boolean;
  created_at?: string;
}

export interface OrderWithTimer extends Order {
  remainingSeconds: number;
}

export interface ServeOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: number;
    price: number;
    satisfaction: number;
    isVip: boolean;
  };
}

export interface OrderStats {
  satisfaction: number;
  served: number;
  failed: number;
  totalEarned: number;
}
