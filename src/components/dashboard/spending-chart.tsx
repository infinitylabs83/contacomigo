"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { BudgetItem, Category } from "@/types"

interface SpendingChartProps {
  items: (BudgetItem & { category?: Category })[]
}

const CAT_EMOJI: Record<string, string> = {
  "Alimentação": "🍔", "Mercado": "🛒", "Transporte": "🚗", "Saúde": "💊",
  "Educação": "📚", "Lazer": "🎮", "Assinaturas": "📱", "Outros": "💸",
  "Moradia": "🏠", "Academia": "🏋️",
}

export function SpendingChart({ items }: SpendingChartProps) {
  const data = items
    .filter((item) => item.amount_spent > 0)
    .map((item) => ({
      name: item.category?.name ?? "Outros",
      value: item.amount_spent,
      color: item.category?.color ?? "#6b7280",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-3xl border bg-card p-4 space-y-3">
      <div>
        <p className="text-sm font-bold">🥧 Gastos por categoria</p>
        {data[0] ? (
          <p className="text-xs text-muted-foreground">
            Maior gasto: <strong>{data[0].name}</strong> com {formatCurrency(data[0].value)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Gastos deste mês por categoria</p>
        )}
      </div>

      {data.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-2xl mb-1">📊</p>
          <p className="text-sm text-muted-foreground">Lance gastos para ver o gráfico</p>
        </div>
      ) : (
      <div className="flex items-center gap-4">
        <div className="w-28 h-28 shrink-0">
          <ResponsiveContainer width="99%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={26} outerRadius={48} paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{ fontSize: "12px", borderRadius: "12px", border: "1px solid #e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="text-sm shrink-0">{CAT_EMOJI[item.name] ?? "💸"}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
              <span className="text-xs font-bold tabular-nums">{Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
