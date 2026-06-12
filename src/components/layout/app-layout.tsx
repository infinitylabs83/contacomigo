"use client"

import { useEffect, useState } from "react"
import { TopNav } from "./top-nav"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { QuickAdd } from "./quick-add"
import { Onboarding } from "./onboarding"
import { createClient } from "@/lib/supabase/client"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [userName, setUserName] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      const name = (user.user_metadata?.full_name as string)?.split(" ")[0] ?? ""
      setUserName(name)
      if (!user.user_metadata?.onboarding_done) setShowOnboarding(true)
    })
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TopNav />
      <div className="lg:hidden">
        <Header title={title} />
      </div>
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {children}
      </main>
      <MobileNav />
      <QuickAdd />
      {showOnboarding && <Onboarding userName={userName} />}
    </div>
  )
}
