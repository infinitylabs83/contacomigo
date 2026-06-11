"use client"

import { useState } from "react"
import { Settings, Bell, Moon, Sun, Globe, LogOut, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Personalize seu Conta Comigo</p>
      </div>

      {/* Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Seu plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Plano Grátis</p>
              <p className="text-xs text-muted-foreground">1 cartão · 2 metas · Recursos básicos</p>
            </div>
            <Badge variant="secondary">Grátis</Badge>
          </div>
          <Button className="w-full" size="sm">Fazer upgrade para Pro — R$ 19,90/mês</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Sun className="size-4" />Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {[{ value: "light", label: "Claro", icon: Sun }, { value: "dark", label: "Escuro", icon: Moon }, { value: "system", label: "Sistema", icon: Globe }].map((t) => (
              <Button
                key={t.value}
                variant={theme === t.value ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setTheme(t.value)}
              >
                <t.icon className="size-3.5" />{t.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Bell className="size-4" />Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Fatura próxima do vencimento", desc: "3 dias antes" },
            { label: "Orçamento estourado", desc: "Ao ultrapassar o limite" },
            { label: "Meta atingida", desc: "Ao completar 100%" },
            { label: "Cobrança de assinatura", desc: "1 dia antes" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Button
                variant="outline"
                size="xs"
                className={notifications ? "border-[var(--success)] text-[var(--success)]" : ""}
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? "Ativo" : "Inativo"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-destructive">Zona de perigo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut className="size-4" />Sair da conta
          </Button>
          <Button variant="outline" size="sm" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="size-4" />Excluir minha conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
