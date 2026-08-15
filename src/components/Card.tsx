import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  /** Icono del encabezado. Decorativo: acompana al titulo, no lo sustituye. */
  icon?: LucideIcon
  children: ReactNode
}

export function Card({ title, description, icon: Icon, children }: CardProps) {
  const hasHeader = Boolean(title || description)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {hasHeader && (
        <header className="mb-5 flex items-start gap-3">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          )}
          <div>
            {title && <h2 className="font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
        </header>
      )}
      {children}
    </section>
  )
}
