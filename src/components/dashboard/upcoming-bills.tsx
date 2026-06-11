"use client"

import { MoneyText } from "@/components/ui/money-text"
import { formatRelativeDate } from "@/lib/utils"
import type { FinancialTask } from "@/types"
import Link from "next/link"

interface UpcomingBillsProps {
  tasks: FinancialTask[]
}

const PRIORITY_CONFIG: Record<string, { emoji: string; bg: string; text: string; label: string }> = {
  urgent_important: { emoji: "🔥", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", label: "Urgente" },
  important:        { emoji: "⚡", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", label: "Importante" },
  urgent:           { emoji: "⏰", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", label: "Urgente" },
  low:              { emoji: "📌", bg: "bg-muted/50", text: "text-muted-foreground", label: "Baixa" },
}

export function UpcomingBills({ tasks }: UpcomingBillsProps) {
  const pending = tasks.filter((t) => t.status === "pending").slice(0, 4)

  return (
    <div className="rounded-3xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5">📋 Plano de Ação</p>
          <p className="text-xs text-muted-foreground">{pending.length} {pending.length === 1 ? "tarefa pendente" : "tarefas pendentes"}</p>
        </div>
        <Link href="/plan" className="text-xs font-semibold text-primary hover:underline">Ver todas</Link>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-sm text-muted-foreground">Tudo em dia!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((task) => {
            const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low
            return (
              <Link key={task.id} href="/plan">
                <div className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity ${cfg.bg}`}>
                  <span className="text-xl shrink-0">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${cfg.text}`}>{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                  </div>
                  {task.estimated_impact && (
                    <MoneyText value={task.estimated_impact} size="sm" className="text-muted-foreground shrink-0" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
