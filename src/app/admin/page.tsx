import { Users, TrendingUp, Activity, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Admin — no personal financial data exposed, only aggregated metrics
export default function AdminPage() {
  const metrics = [
    { label: "Usuários cadastrados", value: "1.247", icon: Users, trend: "+12 esta semana" },
    { label: "Usuários ativos (30d)", value: "834", icon: Activity, trend: "67% de retenção" },
    { label: "Total de transações", value: "45.280", icon: TrendingUp, trend: "Agregado" },
    { label: "Incidentes de segurança", value: "0", icon: Shield, trend: "Últimos 30 dias" },
  ]

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Métricas agregadas — dados pessoais dos usuários não são exibidos</p>
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2 text-sm text-warning">
        <AlertTriangle className="size-4 shrink-0" />
        Este painel exibe apenas métricas agregadas. Dados financeiros individuais são privados e protegidos por RLS.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Planos ativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[{ plan: "Grátis", count: 1089, percent: 87 }, { plan: "Pro", count: 145, percent: 12 }, { plan: "Premium", count: 13, percent: 1 }].map((p) => (
              <div key={p.plan} className="flex items-center gap-3">
                <span className="text-sm w-16">{p.plan}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.percent}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{p.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Crescimento mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { month: "Abril 2025", users: 980 },
              { month: "Maio 2025", users: 1120 },
              { month: "Junho 2025", users: 1247 },
            ].map((r) => (
              <div key={r.month} className="flex items-center justify-between py-1 border-b last:border-0">
                <span className="text-muted-foreground">{r.month}</span>
                <Badge variant="secondary">{r.users} usuários</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
