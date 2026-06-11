import { Shield, Download, Trash2, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Privacidade e Dados</h1>
          <p className="text-sm text-muted-foreground">Você tem controle total sobre seus dados</p>
        </div>
      </div>

      {/* LGPD Rights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Seus direitos (LGPD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Download className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Exportar meus dados</p>
                <p className="text-xs text-muted-foreground">Baixe todos os seus dados em JSON ou CSV</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Exportar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Eye className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Ver meus dados</p>
                <p className="text-xs text-muted-foreground">Visualize todas as informações que armazenamos</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Visualizar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Trash2 className="size-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">Excluir dados financeiros</p>
                <p className="text-xs text-muted-foreground">Remove transações, contas e cartões</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30">Excluir</Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Consentimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: "Dados necessários para o serviço", desc: "Transações, contas e configurações. Obrigatório.", status: "Ativo", required: true },
            { title: "Melhorias do produto", desc: "Dados anônimos de uso para melhorar o app.", status: "Ativo", required: false },
            { title: "Comunicações por e-mail", desc: "Dicas financeiras e novidades do produto.", status: "Ativo", required: false },
          ].map((c) => (
            <div key={c.title} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
              <Button size="xs" variant={c.required ? "secondary" : "outline"} disabled={c.required}>
                {c.status}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-muted-foreground" />
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-muted-foreground" />
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        O Conta Comigo segue a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        Seus dados nunca são vendidos ou compartilhados com terceiros.
      </p>
    </div>
  )
}
