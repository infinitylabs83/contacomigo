import { TopNav } from "./top-nav"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { QuickAdd } from "./quick-add"
import { RefreshOnTransaction } from "./refresh-on-transaction"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
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
      <RefreshOnTransaction />
    </div>
  )
}
