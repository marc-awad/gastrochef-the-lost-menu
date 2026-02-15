import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

interface InventoryLine {
  id: number;
  quantity: number;
  purchased_at: string;
  expiration_date: string;
  days_until_expiration: number;
  status: 'fresh' | 'warning' | 'critical' | 'expired';
}

interface InventoryItem {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_price: number;
  total_quantity: number;
  lines: InventoryLine[];
}

const STATUS_CONFIG = {
  fresh: {
    label: 'Frais',
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/50',
  },
  warning: {
    label: 'Attention',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
  },
  critical: {
    label: 'Critique',
    icon: TrendingDown,
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-700/50',
  },
  expired: {
    label: 'Périmé',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-700/50',
  },
};

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const loadInventory = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/inventory');
      const data: InventoryItem[] = res.data?.data || [];
      setInventory(data);
    } catch (error) {
      console.error('❌ [loadInventory]', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const toggleExpand = (ingredientId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTotalByStatus = (status: keyof typeof STATUS_CONFIG): number => {
    return inventory.reduce((total, item) => {
      const linesWithStatus = item.lines.filter(
        (line) => line.status === status
      );
      return (
        total + linesWithStatus.reduce((sum, line) => sum + line.quantity, 0)
      );
    }, 0);
  };

  const criticalItems = inventory.filter((item) =>
    item.lines.some((line) => line.status === 'critical')
  );

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
                <Package size={24} className="text-violet-400" />
              </div>
              <h1
                className="text-4xl font-black tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Mon <span className="text-violet-400">Inventaire</span>
              </h1>
            </div>
            <p className="text-slate-400 ml-14 text-sm">
              Gestion des stocks et dates de péremption (DLC)
            </p>
          </div>

          <button
            onClick={loadInventory}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg hover:bg-slate-700/60 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* Alerts critiques */}
        {criticalItems.length > 0 && (
          <div className="mb-6 p-4 bg-orange-900/20 border border-orange-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
              <AlertTriangle size={20} />
              Attention : {criticalItems.length} ingrédient
              {criticalItems.length > 1 ? 's' : ''} expire
              {criticalItems.length > 1 ? 'nt' : ''} dans moins de 24h !
            </div>
            <div className="flex flex-wrap gap-2">
              {criticalItems.map((item) => (
                <span
                  key={item.ingredient_id}
                  className="text-xs bg-orange-900/30 border border-orange-700/40 px-2 py-1 rounded-full text-orange-300"
                >
                  {item.ingredient_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(
            Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>
          ).map((status) => {
            const config = STATUS_CONFIG[status];
            const total = getTotalByStatus(status);
            const Icon = config.icon;

            return (
              <div
                key={status}
                className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={config.color} />
                  <span className="text-xs text-slate-400 font-medium">
                    {config.label}
                  </span>
                </div>
                <div className={`text-2xl font-black ${config.color}`}>
                  {total}
                </div>
                <div className="text-xs text-slate-500">unités</div>
              </div>
            );
          })}
        </div>

        {/* Liste des ingrédients */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-slate-800/40 border border-slate-700/30 animate-pulse"
              />
            ))}
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <Package size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg">Votre inventaire est vide</p>
            <p className="text-slate-500 text-sm mt-2">
              Achetez des ingrédients sur le marché pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventory.map((item) => {
              const isExpanded = expandedItems.has(item.ingredient_id);
              const oldestLine = item.lines[0]; // FIFO : la première ligne est la plus ancienne
              const statusConfig = STATUS_CONFIG[oldestLine.status];
              const Icon = statusConfig.icon;

              return (
                <div
                  key={item.ingredient_id}
                  className={`rounded-xl border bg-slate-800/50 backdrop-blur-sm overflow-hidden transition-all ${statusConfig.border}`}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(item.ingredient_id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}
                      >
                        <Package size={20} className={statusConfig.color} />
                      </div>

                      <div className="text-left flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {item.ingredient_name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-400">
                            Total : {item.total_quantity} unités
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.lines.length} lot
                            {item.lines.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Icon size={16} className={statusConfig.color} />
                        <span
                          className={`text-sm font-semibold ${statusConfig.color}`}
                        >
                          {oldestLine.days_until_expiration >= 0
                            ? `J-${oldestLine.days_until_expiration}`
                            : 'Périmé'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Détails FIFO */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2 bg-slate-900/30">
                      <div className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1">
                        <Clock size={12} />
                        Détails par lot (ordre FIFO : du plus ancien au plus
                        récent)
                      </div>
                      {item.lines.map((line, index) => {
                        const lineConfig = STATUS_CONFIG[line.status];
                        const LineIcon = lineConfig.icon;

                        return (
                          <div
                            key={line.id}
                            className={`p-3 rounded-lg border ${lineConfig.bg} ${lineConfig.border} flex items-center justify-between`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-slate-900/50 px-2 py-0.5 rounded text-slate-400 font-mono">
                                #{index + 1}
                              </span>
                              <LineIcon
                                size={14}
                                className={lineConfig.color}
                              />
                              <div>
                                <div
                                  className={`text-sm font-semibold ${lineConfig.color}`}
                                >
                                  {line.quantity} unités
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                  <Calendar size={10} />
                                  Acheté le {formatDate(line.purchased_at)}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className={`text-sm font-bold ${lineConfig.color}`}
                              >
                                {line.days_until_expiration >= 0
                                  ? `J-${line.days_until_expiration}`
                                  : 'Périmé'}
                              </div>
                              <div className="text-xs text-slate-500">
                                Expire le {formatDate(line.expiration_date)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Légende */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-3">
            Code couleur des dates de péremption :
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(
              Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>
            ).map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;

              return (
                <div key={status} className="flex items-center gap-2">
                  <Icon size={14} className={config.color} />
                  <span className="text-xs text-slate-400">
                    {status === 'fresh' && '>3 jours'}
                    {status === 'warning' && '1-3 jours'}
                    {status === 'critical' && '<24h'}
                    {status === 'expired' && 'Périmé'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
