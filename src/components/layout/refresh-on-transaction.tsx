"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function RefreshOnTransaction() {
  const router = useRouter()
  useEffect(() => {
    const handler = () => router.refresh()
    window.addEventListener("transaction-added", handler)
    return () => window.removeEventListener("transaction-added", handler)
  }, [router])
  return null
}
