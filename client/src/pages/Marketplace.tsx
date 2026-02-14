import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Package,
  Coins,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Beef,
  Carrot,
  Cherry,
  Egg,
  Fish,
  Flame,
  Leaf,
  Milk,
  Salad,
  Sandwich,
  Star,
  Wheat,
  Wind,
  Drumstick,
} from 'lucide-react';
import api from '../services/api';
import { useGame } from '../context/GameContext';

interface Ingredient {
  id: number;
  name: string;
  price: number;
}

interface InventoryItem {
  id: number;
  ingredient_id: number;
  quantity: number;
  ingredient: Ingredient;
}

const INGREDIENT_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Tomate: Cherry,
  Fromage: Star,
  'Pomme de terre': Leaf,
  Oignon: Wind,
  Carotte: Carrot,
  Poulet: Drumstick,
  Boeuf: Beef,
  Poivron: Flame,
  Lait: Milk,
  Œuf: Egg,
  Beurre: Sandwich,
  Sel: Star,
  Poivre: Star,
  Pâtes: Wheat,
  Riz: Leaf,
  Bacon: Beef,
  Crème: Milk,
  Champignon: Salad,
  Thon: Fish,
  Saumon: Fish,
};

const getIcon = (name: string) => INGREDIENT_ICONS[name] ?? Package;

const getPriceColor = (price: number) => {
  if (price <= 0.5) return 'text-emerald-400';
  if (price <= 1.5) return 'text-amber-400';
  return 'text-rose-400';
};

const getPriceBadgeBg = (price: number) => {
  if (price <= 0.5) return 'bg-emerald-900/60 border-emerald-700/50';
  if (price <= 1.5) return 'bg-amber-900/60 border-amber-700/50';
  return 'bg-rose-900/60 border-rose-700/50';
};

export default function Marketplace() {
  const { stats, updateStats } = useGame();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [ingredientsRes, inventoryRes] = await Promise.all([
        api.get('/ingredients'),
        api.get('/inventory'),
      ]);

      const rawIngredients: any[] =
        ingredientsRes.data?.data ??
        ingredientsRes.data?.ingredients ??
        (Array.isArray(ingredientsRes.data) ? ingredientsRes.data : []);

      const rawInventory: any[] =
        inventoryRes.data?.data ??
        (Array.isArray(inventoryRes.data) ? inventoryRes.data : []);

      // ✅ FIX : Sequelize renvoie les colonnes DECIMAL comme string depuis MySQL
      // On force price en number pour pouvoir appeler .toFixed()
      const parsedIngredients: Ingredient[] = rawIngredients.map((ing) => ({
        ...ing,
        price: parseFloat(ing.price),
      }));

      setIngredients(parsedIngredients);

      const stockMap: Record<number, number> = {};
      rawInventory.forEach((item: InventoryItem) => {
        stockMap[item.ingredient_id] = item.quantity;
      });
      setInventory(stockMap);

      const initQty: Record<number, number> = {};
      parsedIngredients.forEach((ing) => {
        initQty[ing.id] = 1;
      });
      setQuantities(initQty);
    } catch (err) {
      console.error('❌ [loadData]', err);
      showToast('error', 'Impossible de charger le marché');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const setQty = (id: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(99, value)),
    }));
  };

  const handleBuy = async (ingredient: Ingredient) => {
    const quantity = quantities[ingredient.id] ?? 1;
    const totalCost = ingredient.price * quantity;

    if (stats.treasury < totalCost) {
      showToast(
        'error',
        `Fonds insuffisants (manque ${(totalCost - stats.treasury).toFixed(2)}€)`
      );
      return;
    }

    setBuying(ingredient.id);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: { newTreasury: number };
      }>('/marketplace/buy', {
        ingredientId: ingredient.id,
        quantity,
      });

      if (res.data.success) {
        updateStats({ treasury: res.data.data.newTreasury });
        setInventory((prev) => ({
          ...prev,
          [ingredient.id]: (prev[ingredient.id] ?? 0) + quantity,
        }));
        showToast(
          'success',
          `x${quantity} ${ingredient.name} acheté${quantity > 1 ? 's' : ''} !`
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erreur lors de l'achat";
      showToast('error', msg);
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-600 text-emerald-100'
              : 'bg-rose-900/90 border-rose-600 text-rose-100'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <ShoppingCart size={24} className="text-amber-400" />
            </div>
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Marché aux <span className="text-amber-400">Ingrédients</span>
            </h1>
          </div>
          <p className="text-slate-400 ml-14 text-sm">
            Approvisionnez votre cuisine pour préparer vos recettes
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-2xl px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Coins size={20} className="text-amber-400" />
            <span className="text-slate-400 text-sm font-medium">
              Trésorerie disponible
            </span>
          </div>
          <span className="text-2xl font-black text-amber-400 tabular-nums">
            {stats.treasury.toFixed(2)}€
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-slate-800/40 border border-slate-700/30 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ingredients.map((ingredient) => {
              const Icon = getIcon(ingredient.name);
              const qty = quantities[ingredient.id] ?? 1;
              const totalCost = ingredient.price * qty;
              const canAfford = stats.treasury >= totalCost;
              const stock = inventory[ingredient.id] ?? 0;
              const isBuying = buying === ingredient.id;

              return (
                <div
                  key={ingredient.id}
                  className={`group relative flex flex-col rounded-2xl border bg-slate-800/50 backdrop-blur-sm transition-all duration-200 overflow-hidden ${
                    canAfford
                      ? 'border-slate-700/50 hover:border-slate-500/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30'
                      : 'border-slate-800/50 opacity-60'
                  }`}
                >
                  {stock > 0 && (
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-slate-900/80 border border-slate-600/50 rounded-full px-2 py-0.5">
                      <Package size={10} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-300">
                        {stock}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center pt-6 pb-3 px-4">
                    <div className="mb-3 p-3 rounded-xl bg-slate-700/50 border border-slate-600/30 group-hover:scale-105 transition-transform duration-200">
                      <Icon size={28} className="text-slate-200" />
                    </div>
                    <h3 className="text-sm font-bold text-white text-center leading-tight mb-1">
                      {ingredient.name}
                    </h3>
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPriceBadgeBg(ingredient.price)} ${getPriceColor(ingredient.price)}`}
                    >
                      {ingredient.price.toFixed(2)}€/u
                    </div>
                  </div>

                  <div className="px-3 pb-3 mt-auto space-y-2">
                    <div className="flex items-center justify-between bg-slate-900/60 rounded-lg border border-slate-700/40 overflow-hidden">
                      <button
                        onClick={() => setQty(ingredient.id, qty - 1)}
                        className="px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={qty}
                        onChange={(e) =>
                          setQty(ingredient.id, parseInt(e.target.value) || 1)
                        }
                        className="w-10 text-center text-sm font-bold bg-transparent text-white outline-none tabular-nums"
                      />
                      <button
                        onClick={() => setQty(ingredient.id, qty + 1)}
                        className="px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleBuy(ingredient)}
                      disabled={!canAfford || isBuying}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        canAfford && !isBuying
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-900/30 active:scale-95'
                          : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isBuying ? (
                        <span className="animate-pulse">⏳</span>
                      ) : (
                        <>
                          <ShoppingCart size={12} />
                          {totalCost.toFixed(2)}€
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(inventory).length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-slate-200">Mon stock</h2>
              <span className="text-xs text-slate-500 font-medium">
                ({Object.values(inventory).reduce((a, b) => a + b, 0)} unités au
                total)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients
                .filter((ing) => (inventory[ing.id] ?? 0) > 0)
                .map((ing) => {
                  const Icon = getIcon(ing.name);
                  return (
                    <div
                      key={ing.id}
                      className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/40 rounded-full px-3 py-1.5"
                    >
                      <Icon size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-300 font-medium">
                        {ing.name}
                      </span>
                      <span className="text-xs font-bold text-amber-400 tabular-nums">
                        ×{inventory[ing.id]}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
