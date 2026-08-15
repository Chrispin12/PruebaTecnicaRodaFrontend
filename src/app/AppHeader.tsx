import { Zap } from 'lucide-react'

/**
 * Barra superior fija. Se mantiene oscura en todo el recorrido para no depender de la posicion
 * del scroll ni de la seccion que haya debajo.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-500 text-slate-950">
            <Zap className="size-4" aria-hidden="true" />
          </span>
          Roda
        </span>
        <span className="hidden text-sm text-slate-400 sm:inline">
          Financiación de movilidad eléctrica
        </span>
      </div>
    </header>
  )
}
