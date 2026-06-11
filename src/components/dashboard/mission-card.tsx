"use client"

import { motion } from "framer-motion"
import { Flame, Zap, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { GamificationState } from "@/types"

interface MissionCardProps {
  gamification: GamificationState
}

const levelNames = ["Iniciante 🌱", "Curioso 👀", "Organizado 📋", "Consciente 🧠", "Estrategista 🎯", "Mestre Financeiro 🏆"]

export function MissionCard({ gamification }: MissionCardProps) {
  const { health_score, total_points, level, streak_days, weekly_missions } = gamification
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)]
  const pointsInLevel = total_points % 500
  const progressPct = (pointsInLevel / 500) * 100

  return (
    <div className="space-y-3">
      {/* Score hero card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-white/75 text-xs font-medium mb-1">Saúde financeira</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">{health_score}</span>
              <span className="text-white/60 text-sm mb-1.5">/100</span>
            </div>
            <p className="text-sm font-semibold mt-1">{levelName}</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm">
              <Flame className="size-5 mx-auto mb-0.5" />
              <p className="text-lg font-black leading-none">{streak_days}</p>
              <p className="text-xs text-white/70">dias</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur-sm">
              <Zap className="size-5 mx-auto mb-0.5" />
              <p className="text-lg font-black leading-none">{total_points}</p>
              <p className="text-xs text-white/70">pts</p>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="relative mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>Nível {level}</span>
            <span>{pointsInLevel}/500 pts para o nível {level + 1}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Missions */}
      <div className="rounded-3xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <p className="text-sm font-bold">Missões da semana</p>
        </div>
        {weekly_missions.map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
              mission.is_completed
                ? "bg-green-50 dark:bg-green-950/30"
                : "bg-muted/50"
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 ${
              mission.is_completed
                ? "bg-green-500 text-white"
                : "bg-muted-foreground/20 text-muted-foreground"
            }`}>
              {mission.is_completed ? "✓" : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${mission.is_completed ? "line-through text-muted-foreground" : ""}`}>
                {mission.title}
              </p>
              {!mission.is_completed && mission.total > 1 && (
                <Progress value={(mission.progress / mission.total) * 100} className="h-1 mt-1.5" />
              )}
            </div>
            <span className="text-xs font-bold text-amber-500 shrink-0">+{mission.points}pts</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
