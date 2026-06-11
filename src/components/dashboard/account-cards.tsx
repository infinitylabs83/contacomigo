"use client"

import { motion } from "framer-motion"
import { MoneyText } from "@/components/ui/money-text"
import type { Account } from "@/types"
import Link from "next/link"

const TYPE_EMOJI: Record<string, string> = {
  checking: "🏦", savings: "🐷", wallet: "👛", investment: "📈", loan: "💳", other: "💰",
}

interface AccountCardsProps {
  accounts: Account[]
  totalBalance: number
}

export function AccountCards({ accounts, totalBalance }: AccountCardsProps) {
  const active = accounts.filter((a) => a.is_active)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-muted-foreground">Minhas contas 🏦</h2>
        <Link href="/accounts" className="text-xs font-semibold text-primary hover:underline">Ver todas</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {active.slice(0, 3).map((account, i) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href="/accounts">
              <div
                className="rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${account.color}18, ${account.color}08)`, border: `1.5px solid ${account.color}30` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${account.color}25` }}
                  >
                    {TYPE_EMOJI[account.type] ?? "💰"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{account.institution ?? account.type}</p>
                    <p className="text-sm font-semibold truncate">{account.name.replace(/^(Conta |Poupança )/, "")}</p>
                  </div>
                </div>
                <MoneyText value={account.current_balance} size="lg" className="font-black" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Total strip */}
      <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(124,58,237,0.06)", border: "1.5px solid rgba(124,58,237,0.12)" }}>
        <span className="text-sm font-semibold text-muted-foreground">💼 Saldo total</span>
        <MoneyText value={totalBalance} size="lg" className="font-black" />
      </div>
    </div>
  )
}
