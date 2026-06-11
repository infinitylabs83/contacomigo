"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[AppError]", error)
  }, [error])

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#faf9f7", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Algo deu errado</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
          {error.message || "Erro desconhecido ao carregar a página."}
        </p>
        {error.digest && (
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 24, fontFamily: "monospace" }}>
            ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ padding: "10px 20px", borderRadius: 12, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
          >
            Tentar novamente
          </button>
          <Link href="/login" style={{ padding: "10px 20px", borderRadius: 12, background: "#f3f4f6", color: "#374151", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block" }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
