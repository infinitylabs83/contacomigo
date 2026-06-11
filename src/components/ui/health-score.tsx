import { cn } from "@/lib/utils"

interface HealthScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 80) return { ring: "stroke-[var(--success)]", text: "text-[var(--success)]", label: "Excelente" }
  if (score >= 60) return { ring: "stroke-primary", text: "text-primary", label: "Bom" }
  if (score >= 40) return { ring: "stroke-[var(--warning)]", text: "text-[var(--warning)]", label: "Atenção" }
  return { ring: "stroke-destructive", text: "text-destructive", label: "Crítico" }
}

export function HealthScore({ score, size = "md", showLabel = false, className }: HealthScoreProps) {
  const { ring, text, label } = getScoreColor(score)
  const sizes = { sm: 48, md: 64, lg: 96 }
  const dim = sizes[size]
  const radius = (dim / 2) - 6
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
          <circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none" stroke="currentColor" strokeWidth="4"
            className="text-muted/30"
          />
          <circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none" strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={cn("transition-all duration-700", ring)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold tabular-nums", text, size === "lg" ? "text-xl" : size === "md" ? "text-sm" : "text-xs")}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", text)}>{label}</span>
      )}
    </div>
  )
}
