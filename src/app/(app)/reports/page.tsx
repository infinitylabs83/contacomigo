"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoneyText } from "@/components/ui/money-text"
import { formatCurrency, getMonthName } from "@/lib/utils"
import { DEMO_BUDGET_ITEMS, DEMO_CATEGORIES, DEMO_TRANSACTIONS } from "@/lib/demo-data"

const now = new Date()

const monthlyData = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
  const base = 7500 + Math.random() * 1200 - 600
  const exp = 4200 + Math.random() * 1500 - 750
  return {
    month: getMonthName(d.getMonth()).slice(0, 3),
    receitas: Math.round(base),
    gastos: Math.round(exp),
    saldo: Math.round(base - exp),
  }
})

const categoryData = DEMO_BUDGET_ITEMS
  .filter((i) => i.amount_spent > 0)
  .map((item) => ({
    name: DEMO_CATEGORIES.find((c) => c.id === item.category_id)?.name ?? "Outros",
    value: item.amount_spent,
    color: DEMO_CATEGORIES.find((c) => c.id === item.category_id)?.color ?? "#6b7280",
  }))
  .sort((a, b) => b.value - a.value)

export default function ReportsPage() {
  const totalExpenses = DEMO_TRANSACTIONS.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const topCategory = categoryData[0]

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Entenda para onde vai seu dinheiro</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="flow">Fluxo de caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          {/* Income vs Expenses bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Receitas vs Gastos — últimos 6 meses</CardTitle>
              <p className="text-xs text-muted-foreground">Você precisa se preocupar? Verifique os meses em que os gastos ultrapassam as receitas.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="99%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="receitas" name="Receitas" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" name="Gastos" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Balance evolution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evolução do saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="99%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="saldo" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)" }} name="Saldo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gastos por categoria — mês atual</CardTitle>
              <p className="text-xs text-muted-foreground">
                Seu maior gasto foi <strong>{topCategory?.name}</strong> com <MoneyText value={topCategory?.value ?? 0} size="sm" />.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-52 h-52 shrink-0">
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2}>
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm flex-1">{item.name}</span>
                      <MoneyText value={item.value} size="sm" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {((item.value / totalExpenses) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fluxo de caixa mensal</CardTitle>
              <p className="text-xs text-muted-foreground">Meses positivos indicam que você gastou menos do que ganhou.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="99%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="saldo" name="Resultado" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, i) => (
                      <Cell key={i} fill={entry.saldo >= 0 ? "var(--success)" : "var(--destructive)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
