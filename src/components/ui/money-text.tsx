import { cn } from "@/lib/utils"

interface MoneyTextProps {
  value: number
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  colored?: boolean
  showSign?: boolean
}

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
  xl: "text-xl font-bold",
  "2xl": "text-2xl font-bold",
}

export function MoneyText({ value, className, size = "md", colored = false, showSign = false }: MoneyTextProps) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Math.abs(value))

  const sign = showSign && value > 0 ? "+" : value < 0 ? "-" : ""

  return (
    <span
      className={cn(
        "tabular-nums",
        sizes[size],
        colored && value > 0 && "text-[var(--success)]",
        colored && value < 0 && "text-destructive",
        className
      )}
    >
      {sign}{formatted}
    </span>
  )
}
