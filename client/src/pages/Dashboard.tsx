import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  TrendingUp,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useGame } from '../context/GameContext';

interface TransactionRow {
  id: number;
  type: string;
  amount: number;
  description: string;
  balance_after: number;
  created_at: string;
}

interface DashboardStats {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
  };
  treasuryHistory: { date: string; balance: number; type: string }[];
  pieData: { name: string; value: number; type: string }[];
  profitability: {
    id: number;
    name: string;
    salePrice: number;
    ingredientCost: number;
    margin: number;
    marginPct: number;
  }[];
}

const TYPE_LABELS: Record<string, string> = {
  order_revenue: 'Vente',
  ingredient_purchase: 'Achat',
  vip_bonus: 'Bonus VIP',
  vip_penalty: 'Pénalité',
  initial_treasury: 'Initial',
  all: 'Tous',
};

const TYPE_COLORS: Record<string, string> = {
  order_revenue: '#10b981',
  ingredient_purchase: '#f59e0b',
  vip_bonus: '#6366f1',
  vip_penalty: '#ef4444',
  initial_treasury: '#64748b',
};

const PIE_COLORS = [
  '#10b981',
  '#f59e0b',
  '#6366f1',
  '#ef4444',
  '#64748b',
  '#0ea5e9',
];

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

const KpiCard = ({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-5 backdrop-blur-sm">
    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-2">
      {label}
    </p>
    <p
      className={`text-xl md:text-2xl font-black tabular-nums ${positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-rose-400'}`}
    >
      {value}
    </p>
    {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-emerald-400 font-bold">{fmt(payload[0].value)}€</p>
    </div>
  );
};

export default function Dashboard() {
  const { stats } = useGame();

  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => {
        if (res.data.success) setDashStats(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadTransactions = (page: number, type: string) => {
    setTxLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (type !== 'all') params.set('type', type);

    api
      .get(`/transactions?${params}`)
      .then((res) => {
        if (res.data.success) {
          setTransactions(res.data.data);
          setPagination(res.data.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setTxLoading(false));
  };

  useEffect(() => {
    loadTransactions(1, typeFilter);
  }, [typeFilter]);

  const handlePageChange = (newPage: number) => {
    loadTransactions(newPage, typeFilter);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ✅ TICKET #022 : Container responsive */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* ✅ TICKET #022 : Header responsive */}
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">
              Rapport financier
            </p>
            <h1
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Tableau de <span className="text-emerald-400">Bord</span>
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-slate-500 text-xs mb-1">Trésorerie actuelle</p>
            <p className="text-2xl md:text-3xl font-black tabular-nums text-emerald-400">
              {fmt(stats.treasury)}€
            </p>
          </div>
        </div>

        {/* ✅ TICKET #022 : KPI Cards responsive */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 md:h-28 rounded-xl md:rounded-2xl bg-slate-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          dashStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <KpiCard
                label="Revenus totaux"
                value={`${fmt(dashStats.summary.totalRevenue)}€`}
                sub="Commandes servies"
                positive={true}
              />
              <KpiCard
                label="Dépenses totales"
                value={`${fmt(dashStats.summary.totalExpenses)}€`}
                sub="Achats & pénalités"
                positive={false}
              />
              <KpiCard
                label="Solde net"
                value={`${dashStats.summary.netBalance >= 0 ? '+' : ''}${fmt(dashStats.summary.netBalance)}€`}
                sub="Revenus − Dépenses"
                positive={dashStats.summary.netBalance >= 0}
              />
              <KpiCard
                label="Transactions"
                value={String(dashStats.summary.transactionCount)}
                sub="Au total"
              />
            </div>
          )
        )}

        {/* ✅ TICKET #022 : Graphiques responsive */}
        {dashStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Area chart */}
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <BarChart3 size={16} className="text-emerald-400" />
                <h2 className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-widest">
                  Évolution trésorerie
                </h2>
              </div>
              {dashStats.treasuryHistory.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={dashStats.treasuryHistory}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="treasuryGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#475569', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#475569', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}€`}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#treasuryGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#10b981' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Wallet size={16} className="text-amber-400" />
                <h2 className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-widest">
                  Répartition
                </h2>
              </div>
              {dashStats.pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
                  Aucune donnée
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={dashStats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dashStats.pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number | undefined) =>
                          v !== undefined ? [`${fmt(v)}€`, ''] : ['', '']
                        }
                        contentStyle={{
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-1.5">
                    {dashStats.pieData.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-slate-400">{entry.name}</span>
                        </div>
                        <span className="text-slate-300 font-medium tabular-nums">
                          {fmt(entry.value)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ✅ TICKET #022 : Tableau rentabilité avec scroll horizontal */}
        {dashStats && dashStats.profitability.length > 0 && (
          <div className="mb-6 md:mb-8 bg-slate-800/60 border border-slate-700/50 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-700/50 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <h2 className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-widest">
                Rentabilité par plat
              </h2>
            </div>
            {/* ✅ TICKET #022 : Wrapper scroll horizontal mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['Plat', 'Prix vente', 'Coût', 'Marge', 'Marge %'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 md:px-6 py-2 md:py-3 text-left text-xs text-slate-500 font-medium uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dashStats.profitability.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-2 md:py-3 font-medium text-white">
                        {row.name}
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-slate-300 tabular-nums">
                        {fmt(row.salePrice)}€
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-slate-300 tabular-nums">
                        {fmt(row.ingredientCost)}€
                      </td>
                      <td
                        className={`px-4 md:px-6 py-2 md:py-3 font-semibold tabular-nums ${row.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {row.margin >= 0 ? '+' : ''}
                        {fmt(row.margin)}€
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${row.marginPct >= 30 ? 'bg-emerald-500' : row.marginPct >= 15 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{
                                width: `${Math.min(100, Math.max(0, row.marginPct))}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold tabular-nums ${row.marginPct >= 30 ? 'text-emerald-400' : row.marginPct >= 15 ? 'text-amber-400' : 'text-rose-400'}`}
                          >
                            {row.marginPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ TICKET #022 : Tableau transactions avec scroll horizontal */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <h2 className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-widest">
                Historique
              </h2>
              <span className="text-xs text-slate-500">
                ({pagination.total})
              </span>
            </div>

            {/* Filtres responsive */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'all',
                'order_revenue',
                'ingredient_purchase',
                'vip_penalty',
                'vip_bonus',
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    typeFilter === t
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-700/40 text-slate-400 border border-slate-600/30 hover:border-slate-500/50'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ TICKET #022 : Table avec scroll horizontal */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Date', 'Type', 'Description', 'Montant', 'Solde'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 md:px-6 py-2 md:py-3 text-left text-xs text-slate-500 font-medium uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {txLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-4 md:px-6 py-2 md:py-3">
                          <div className="h-3 bg-slate-700/50 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 md:px-6 py-8 md:py-12 text-center text-slate-600"
                    >
                      Aucune transaction
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-2 md:py-3 text-slate-400 text-xs tabular-nums whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            background: `${TYPE_COLORS[tx.type] ?? '#64748b'}20`,
                            color: TYPE_COLORS[tx.type] ?? '#94a3b8',
                            border: `1px solid ${TYPE_COLORS[tx.type] ?? '#64748b'}40`,
                          }}
                        >
                          {TYPE_LABELS[tx.type] ?? tx.type}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-slate-300 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-2 md:py-3 font-semibold tabular-nums ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        <div className="flex items-center gap-1">
                          {tx.amount >= 0 ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {tx.amount >= 0 ? '+' : ''}
                          {fmt(tx.amount)}€
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-slate-300 tabular-nums font-medium">
                        {fmt(tx.balance_after)}€
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-1.5 rounded-lg border border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
