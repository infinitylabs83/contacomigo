import Link from "next/link"
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  href: string
  className?: string
  children: React.ReactNode
  external?: boolean
  style?: React.CSSProperties
}

export function ButtonLink({ href, variant, size, className, children, external, style }: ButtonLinkProps) {
  const cls = cn(buttonVariants({ variant, size }), className)
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{children}</a>
  }
  return <Link href={href} className={cls} style={style}>{children}</Link>
}
