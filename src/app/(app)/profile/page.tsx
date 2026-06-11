import { User, Star, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HealthScore } from "@/components/ui/health-score"
import { getUser, getGamification } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const levelNames = ["Iniciante", "Curioso", "Organizado", "Consciente", "Estrategista", "Mestre Financeiro"]

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const gamification = await getGamification()

  const health_score  = gamification?.health_score  ?? 0
  const total_points  = gamification?.total_points  ?? 0
  const level         = gamification?.level         ?? 1
  const streak_days   = gamification?.streak_days   ?? 0
  const achievements  = gamification?.achievements  ?? []

  const fullName = (user.user_metadata?.full_name as string) ?? ""
  const email    = user.email ?? ""
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)]

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* Avatar + stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-10 text-primary" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{fullName || "Usuário"}</h2>
              <p className="text-muted-foreground text-sm">{email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                <Badge variant="secondary">Nível {level} — {levelName}</Badge>
                <Badge variant="outline">Plano Grátis</Badge>
              </div>
            </div>
            <HealthScore score={health_score} size="lg" showLabel />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{total_points}</p>
            <p className="text-xs text-muted-foreground">pontos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{streak_days} 🔥</p>
            <p className="text-xs text-muted-foreground">dias seguidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{level}</p>
            <p className="text-xs text-muted-foreground">nível atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações da conta */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Informações da conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Nome</span>
            <span className="text-sm font-medium">{fullName || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">E-mail</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Membro desde</span>
            <span className="text-sm font-medium">
              {new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Plano</span>
            <Badge variant="outline">Grátis — Lançamento</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="size-4" style={{ color: "#f59e0b" }} /> Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {(achievements as any[]).map((a: any) => (
                <div key={a.id} className="flex flex-col items-center gap-1 p-3 rounded-xl text-center bg-primary/10">
                  <span className="text-2xl">{a.icon ?? "🏅"}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{a.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Comece a usar o app para desbloquear conquistas! 🏆
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sair */}
      <form action={async () => {
        "use server"
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect("/login")
      }}>
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
          <LogOut size={16} /> Sair da conta
        </button>
      </form>
    </div>
  )
}
