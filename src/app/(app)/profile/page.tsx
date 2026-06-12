import { User, Star, LogOut, Zap, Flame, TrendingUp, Lock } from "lucide-react"
import { HealthScore } from "@/components/ui/health-score"
import { getUser } from "@/lib/data"
import { redirect } from "next/navigation"
import { signOut } from "./actions"
import { createClient } from "@/lib/supabase/server"

const levelNames = ["Iniciante 🌱", "Curioso 👀", "Organizado 📋", "Consciente 🧠", "Estrategista 🎯", "Mestre Financeiro 🏆"]
const levelThresholds = [0, 500, 1500, 3000, 6000, 10000]

// Fixed achievement definitions — shown locked/unlocked
const ALL_ACHIEVEMENTS = [
  { id: "first_account",    icon: "🏦", name: "Primeira conta",       desc: "Cadastrou uma conta bancária",          check: (d: any) => d.accounts > 0 },
  { id: "first_txn",        icon: "📝", name: "Primeiro lançamento",  desc: "Registrou o primeiro gasto",            check: (d: any) => d.txnCount > 0 },
  { id: "first_income",     icon: "💚", name: "Renda registrada",     desc: "Registrou a primeira entrada",          check: (d: any) => d.hasIncome },
  { id: "five_txns",        icon: "✏️", name: "Em ritmo",             desc: "Lançou 5 gastos",                       check: (d: any) => d.txnCount >= 5 },
  { id: "twenty_txns",      icon: "📊", name: "Consistente",          desc: "Lançou 20 gastos",                      check: (d: any) => d.txnCount >= 20 },
  { id: "first_budget",     icon: "🎯", name: "Orçamenteiro",         desc: "Definiu um limite de categoria",        check: (d: any) => d.hasBudget },
  { id: "first_goal",       icon: "✈️", name: "Sonhador",             desc: "Criou a primeira meta",                 check: (d: any) => d.hasGoal },
  { id: "first_task",       icon: "📋", name: "Planejador",           desc: "Criou a primeira tarefa",               check: (d: any) => d.hasTask },
  { id: "positive_month",   icon: "🏆", name: "Mês no azul",          desc: "Fechou um mês com saldo positivo",      check: (d: any) => d.positiveMonth },
  { id: "streak_7",         icon: "🔥", name: "Semana de fogo",       desc: "7 dias seguidos usando o app",          check: (d: any) => d.streak >= 7 },
  { id: "streak_30",        icon: "💎", name: "Mês dedicado",         desc: "30 dias seguidos usando o app",         check: (d: any) => d.streak >= 30 },
  { id: "first_card",       icon: "💳", name: "Cartão cadastrado",    desc: "Adicionou um cartão de crédito",        check: (d: any) => d.hasCard },
]

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) return redirect("/login")

  const supabase = await createClient()
  const now   = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year  = now.getFullYear()
  const from  = `${year}-${month}-01`
  const to    = `${year}-${month}-31`

  const [
    { data: allTxns },
    { data: monthTxns },
    { data: accounts },
    { data: goals },
    { data: tasks },
    { data: cards },
    { data: budgetLimits },
    { data: gamification },
  ] = await Promise.all([
    supabase.from("transactions").select("date,type,amount").order("date", { ascending: false }),
    supabase.from("transactions").select("type,amount").gte("date", from).lte("date", to),
    supabase.from("accounts").select("id"),
    supabase.from("goals").select("id").limit(1),
    supabase.from("financial_tasks").select("id").limit(1),
    supabase.from("credit_cards").select("id").limit(1),
    supabase.from("budget_limits").select("id").limit(1),
    supabase.from("gamification").select("*").maybeSingle(),
  ])

  const txnCount   = allTxns?.length ?? 0
  const hasIncome  = (monthTxns ?? []).some(t => t.type === "income")
  const monthIn    = (monthTxns ?? []).filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const monthOut   = (monthTxns ?? []).filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  // Calculate streak from transaction dates
  const txnDates = [...new Set((allTxns ?? []).map(t => t.date))].sort().reverse()
  let streak = 0
  if (txnDates.length > 0) {
    const today = now.toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (txnDates[0] === today || txnDates[0] === yesterday) {
      let prev = new Date(txnDates[0] + "T12:00:00")
      streak = 1
      for (let i = 1; i < txnDates.length; i++) {
        const cur = new Date(txnDates[i] + "T12:00:00")
        const diff = Math.round((prev.getTime() - cur.getTime()) / 86400000)
        if (diff === 1) { streak++; prev = cur } else break
      }
    }
  }

  // Points: derived from transactions (10 each) + bonuses
  const rawPoints = txnCount * 10
    + (accounts?.length ?? 0) * 20
    + (goals?.length ?? 0) * 50
    + (tasks?.length ?? 0) * 15
    + (budgetLimits?.length ?? 0) * 40
    + streak * 5

  const total_points = gamification?.total_points
    ? Math.max(gamification.total_points, rawPoints)
    : rawPoints

  // Level from points
  let level = 1
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (total_points >= levelThresholds[i]) { level = i + 1; break }
  }

  // Health score: calculated from real data
  let healthScore = 40
  if (hasIncome) healthScore += 15
  if (monthIn > 0 && monthOut < monthIn) healthScore += 20
  else if (monthOut > monthIn && monthIn > 0) healthScore -= 10
  if ((budgetLimits?.length ?? 0) > 0) healthScore += 10
  if (streak >= 3) healthScore += 5
  if (streak >= 7) healthScore += 5
  if ((goals?.length ?? 0) > 0) healthScore += 5
  healthScore = Math.max(10, Math.min(100, healthScore))

  // Achievement data
  const achieveData = {
    accounts:      (accounts?.length ?? 0),
    txnCount,
    hasIncome,
    hasBudget:     (budgetLimits?.length ?? 0) > 0,
    hasGoal:       (goals?.length ?? 0) > 0,
    hasTask:       (tasks?.length ?? 0) > 0,
    hasCard:       (cards?.length ?? 0) > 0,
    positiveMonth: monthIn > 0 && monthIn > monthOut,
    streak,
  }

  const fullName   = ((user as any).user_metadata?.full_name as string) ?? ""
  const email      = (user as any).email ?? ""
  const levelName  = levelNames[Math.min(level - 1, levelNames.length - 1)]
  const nextLevel  = levelThresholds[Math.min(level, levelThresholds.length - 1)]
  const prevLevel  = levelThresholds[level - 1]
  const progressPct = nextLevel > prevLevel ? Math.round(((total_points - prevLevel) / (nextLevel - prevLevel)) * 100) : 100
  const unlockedCount = ALL_ACHIEVEMENTS.filter(a => a.check(achieveData)).length

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black">Perfil</h1>

      {/* Hero card */}
      <div className="rounded-3xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="size-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black truncate">{fullName || "Usuário"}</h2>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                Nível {level} — {levelName}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                🎉 Fundador
              </span>
            </div>
          </div>
          <HealthScore score={healthScore} size="lg" showLabel />
        </div>

        {/* Level progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{total_points} pts</span>
            <span>{nextLevel} pts para Nível {level + 1}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-primary">{total_points}</p>
          <p className="text-xs text-muted-foreground">pontos</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">{streak}</p>
          <p className="text-xs text-muted-foreground">dias seguidos</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-primary">{unlockedCount}/{ALL_ACHIEVEMENTS.length}</p>
          <p className="text-xs text-muted-foreground">conquistas</p>
        </div>
      </div>

      {/* Como ganhar pontos */}
      <div className="rounded-3xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-4 text-primary" />
          <p className="font-bold text-sm">Como ganhar pontos</p>
        </div>
        <div className="space-y-2">
          {[
            ["📝", "Cada lançamento registrado",        "+10 pts"],
            ["🏦", "Criar uma conta bancária",           "+20 pts"],
            ["🎯", "Definir limite de categoria",        "+40 pts"],
            ["✈️", "Criar uma meta financeira",          "+50 pts"],
            ["📋", "Criar uma tarefa no Planejar",       "+15 pts"],
            ["🔥", "Cada dia com lançamentos seguidos",  "+5 pts/dia"],
          ].map(([emoji, label, pts]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">{emoji}</span>
                <span className="text-muted-foreground">{label}</span>
              </div>
              <span className="font-bold text-primary text-xs">{pts}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
          💡 <strong className="text-foreground">Streak</strong>: lançamentos em dias consecutivos. Se pular um dia, começa do zero.
        </p>
      </div>

      {/* Conquistas */}
      <div className="rounded-3xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" />
            <p className="font-bold text-sm">Conquistas</p>
          </div>
          <span className="text-xs text-muted-foreground">{unlockedCount} de {ALL_ACHIEVEMENTS.length} desbloqueadas</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {ALL_ACHIEVEMENTS.map(a => {
            const unlocked = a.check(achieveData)
            return (
              <div key={a.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all ${
                  unlocked ? "bg-primary/8 border border-primary/20" : "bg-muted/40 border border-border/40"
                }`}>
                <div className="relative">
                  <span className={`text-2xl ${unlocked ? "" : "grayscale opacity-40"}`}>{a.icon}</span>
                  {!unlocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-muted-foreground/30 rounded-full p-0.5">
                      <Lock className="size-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className={`text-[10px] font-semibold leading-tight ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {a.name}
                </p>
                {!unlocked && (
                  <p className="text-[9px] text-muted-foreground/70 leading-tight">{a.desc}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Informações da conta */}
      <div className="rounded-3xl border bg-card p-5">
        <p className="font-bold text-sm mb-4">Informações da conta</p>
        <div className="space-y-3">
          {[
            ["Nome",          fullName || "—"],
            ["E-mail",        email],
            ["Membro desde",  new Date((user as any).created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Plano</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              🎉 Fundador — Acesso Total
            </span>
          </div>
        </div>
      </div>

      {/* Sair */}
      <form action={signOut}>
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
          <LogOut size={16} /> Sair da conta
        </button>
      </form>
    </div>
  )
}
