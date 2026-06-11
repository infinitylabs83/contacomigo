"use client"

import { User, Camera, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { HealthScore } from "@/components/ui/health-score"
import { DEMO_GAMIFICATION } from "@/lib/demo-data"

const levelNames = ["Iniciante", "Curioso", "Organizado", "Consciente", "Estrategista", "Mestre Financeiro"]

export default function ProfilePage() {
  const { health_score, total_points, level, streak_days } = DEMO_GAMIFICATION

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* Avatar + stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-10 text-primary" />
              </div>
              <Button size="icon-xs" variant="outline" className="absolute -bottom-1 -right-1">
                <Camera className="size-3" />
              </Button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">Demo User</h2>
              <p className="text-muted-foreground text-sm">demo@nexomoney.com.br</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="secondary">Nível {level} — {levelNames[Math.min(level - 1, levelNames.length - 1)]}</Badge>
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
            <p className="text-2xl font-bold text-warning">{streak_days}</p>
            <p className="text-xs text-muted-foreground">dias seguidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--success)]">{level}</p>
            <p className="text-xs text-muted-foreground">nível atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input defaultValue="Demo User" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input defaultValue="demo@nexomoney.com.br" disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Renda mensal</Label>
              <Input defaultValue="7500" type="number" />
            </div>
            <div className="space-y-1.5">
              <Label>Dia de recebimento</Label>
              <Input defaultValue="5" type="number" min="1" max="31" />
            </div>
          </div>
          <Button size="sm">Salvar alterações</Button>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="size-4 text-warning" />Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { name: "Primeiro orçamento", icon: "📊", earned: true },
              { name: "7 dias no controle", icon: "🔥", earned: true },
              { name: "Meta criada", icon: "🎯", earned: true },
              { name: "Fatura revisada", icon: "💳", earned: false },
              { name: "Reserva iniciada", icon: "🛡️", earned: false },
            ].map((badge) => (
              <div key={badge.name} className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center ${badge.earned ? "bg-primary/10" : "bg-muted/40 opacity-50"}`}>
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-xs text-muted-foreground leading-tight">{badge.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
