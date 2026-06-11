"use client"

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type Step = "upload" | "preview" | "map" | "confirm" | "done"

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setStep("preview")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "preview", label: "Pré-visualização" },
    { key: "map", label: "Mapeamento" },
    { key: "confirm", label: "Confirmação" },
    { key: "done", label: "Concluído" },
  ]
  const stepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Importar transações</h1>
        <p className="text-sm text-muted-foreground">Importe seu extrato em CSV ou OFX</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < stepIndex ? "bg-[var(--success)] text-white" : i === stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < stepIndex ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block truncate ${i === stepIndex ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === "upload" && (
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-10 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-1">Arraste seu arquivo aqui</p>
              <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary">CSV</Badge>
                <Badge variant="secondary">OFX</Badge>
                <Badge variant="secondary">XLS</Badge>
              </div>
            </div>
            <input ref={inputRef} type="file" accept=".csv,.ofx,.xls,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </CardContent>
        </Card>
      )}

      {step === "preview" && file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4" />{file.name}
              <Badge variant="secondary" className="ml-auto">{(file.size / 1024).toFixed(0)} KB</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-muted-foreground">
              <p>Data,Descrição,Valor,Tipo</p>
              <p>2025-06-01,Salário,7500.00,receita</p>
              <p>2025-06-03,Netflix,-55.90,despesa</p>
              <p>2025-06-05,Mercado,-420.00,despesa</p>
              <p className="text-muted-foreground/50">... mais 47 linhas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>Trocar arquivo</Button>
              <Button className="flex-1 gap-2" onClick={() => setStep("map")}>
                Continuar <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "map" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mapeie as colunas</CardTitle>
            <p className="text-xs text-muted-foreground">Confirme que as colunas estão corretas</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[{ field: "Data", col: "Data", ok: true }, { field: "Descrição", col: "Descrição", ok: true }, { field: "Valor", col: "Valor", ok: true }, { field: "Tipo", col: "Tipo", ok: true }].map((m) => (
              <div key={m.field} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="size-4 text-[var(--success)] shrink-0" />
                <span className="text-sm font-medium flex-1">{m.field}</span>
                <Badge variant="secondary">{m.col}</Badge>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("preview")}>Voltar</Button>
              <Button className="flex-1 gap-2" onClick={() => setStep("confirm")}>
                Continuar <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confirmar importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">50</p>
                <p className="text-xs text-muted-foreground">Total de linhas</p>
              </div>
              <div className="bg-[var(--success)]/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[var(--success)]">48</p>
                <p className="text-xs text-muted-foreground">Válidas</p>
              </div>
              <div className="bg-warning/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-warning">2</p>
                <p className="text-xs text-muted-foreground">Possíveis duplicadas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("map")}>Voltar</Button>
              <Button className="flex-1 gap-2" onClick={() => setStep("done")}>
                Importar agora <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto">
              <CheckCircle className="size-8 text-[var(--success)]" />
            </div>
            <h2 className="text-xl font-bold">Importação concluída!</h2>
            <p className="text-muted-foreground text-sm">48 transações importadas com sucesso.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setStep("upload")}>Importar outro arquivo</Button>
              <ButtonLink href="/transactions">Ver transações</ButtonLink>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
