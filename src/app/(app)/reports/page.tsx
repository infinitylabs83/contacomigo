"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoneyText } from "@/components/ui/money-text"
import { formatCurrency, getMonthName } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function ReportsPage() {
  const now = new Date()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      // Fetch last 6 months of transactions
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const fromDate = sixMonthsAgo.toISOString().split("T")[0]

      const [{ data: txns }, { data: items }, { data: cats }] = await Promise.all([
        supabase.from("transactions").select("*").gte("date", fromDate).order("date", { ascending: true }),
        supabase.from("budget_items").select("*"),
        supabase.from("categories").select("*"),
      ])
      setTransactions(txns ?? [])
      setBudgetItems(items ?? [])
      setCategories(cats ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // Build monthly data from real transactions
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthTxns = transactions.filter((t: any) => t.date?.startsWith(monthStr))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receitas = monthTxns.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gastos = monthTxns.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
    return {
      month: getMonthName(d.getMonth()).slice(0, 3),
      receitas: Math.round(receitas),
      gastos: Math.round(gastos),
      saldo: Math.round(receitas - gastos),
    }
  })

  // Build category data from budget_items + categories
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryData = budgetItems
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => (i.amount_spent ?? 0) > 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: categories.find((c: any) => c.id === item.category_id)?.name ?? "Outros",
      value: item.amount_spent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: categories.find((c: any) => c.id === item.category_id)?.color ?? "#6b7280",
    }))
    .sort((a: any, b: any) => b.value - a.value)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalExpenses = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
  const topCategory = categoryData[0]

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Carregando dados...</p>
      </div>
    )
  }

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
              <p className="text-xs text-muted-foreground">Verifique os meses em que os gastos ultrapassam as receitas.</p>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação encontrada ainda.</p>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Balance evolution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evolução do saldo</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação encontrada ainda.</p>
              ) : (
                <ResponsiveContainer width="99%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Line type="monotone" dataKey="saldo" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)" }} name="Saldo" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gastos por categoria — mês atual</CardTitle>
              {topCategory && (
                <p className="text-xs text-muted-foreground">
                  Seu maior gasto foi <strong>{topCategory.name}</strong> com <MoneyText value={topCategory.value ?? 0} size="sm" />.
                </p>
              )}
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado de orçamento encontrado ainda.</p>
              ) : (
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="w-52 h-52 shrink-0">
                    <ResponsiveContainer width="99%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {categoryData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {categoryData.map((item: any) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm flex-1">{item.name}</span>
                        <MoneyText value={item.value} size="sm" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação encontrada ainda.</p>
              ) : (
                <ResponsiveContainer width="99%" height={240}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="saldo" name="Resultado" radius={[4, 4, 0, 0]}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {monthlyData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.saldo >= 0 ? "var(--success)" : "var(--destructive)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
