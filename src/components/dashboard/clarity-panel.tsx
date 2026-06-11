"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { FinancialSummary } from "@/types"

interface ClarityPanelProps {
  summary: FinancialSummary
}

export function ClarityPanel({ summary }: ClarityPanelProps) {
  const freeMoneyPositive = summary.freeMoney >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
      className="rounded-3xl overflow-hidden p-6 text-white relative"
    >
      {/* decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="absolute -bottom-12 -left-4 w-52 h-52 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.04)" }} />

      <div className="relative space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" style={{ color: "rgba(255,255,255,0.65)" }} />
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Dinheiro livre este mês</p>
        </div>

        {/* Big number */}
        <div>
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-4xl font-black tracking-tight text-white"
          >
            {formatCurrency(summary.freeMoney)}
          </motion.p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
            {freeMoneyPositive
              ? "Você pode gastar isso com segurança ainda este mês 🎉"
              : "Atenção: você gastou mais do que ganhou este mês ⚠️"}
          </p>
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, color: "rgba(134,239,172,1)", label: "Entrou 💚", value: summary.monthIncome },
            { icon: TrendingDown, color: "rgba(252,165,165,1)", label: "Saiu 🔴", value: summary.monthExpenses },
            { emoji: "💳", label: "Cartão", value: summary.openInvoices },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}>
              <div className="flex items-center gap-1 mb-1">
                {item.emoji
                  ? <span className="text-xs">{item.emoji}</span>
                  : item.icon && <item.icon className="size-3" style={{ color: item.color }} />
                }
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>{item.label}</p>
              </div>
              <p className="text-sm font-bold text-white">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Próxima ação</p>
            <p className="text-sm font-semibold text-white">{summary.nextAction.label}</p>
          </div>
          <Link
            href={summary.nextAction.href}
            className="flex items-center gap-1.5 rounded-xl text-sm font-semibold px-4 h-9 bg-white text-primary hover:bg-white/90 transition-colors"
          >
            Resolver
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
