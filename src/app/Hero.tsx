import { ArrowDown, Clock, Coins, Leaf } from 'lucide-react'

import { buttonClasses } from '../components/buttonStyles'

const HIGHLIGHTS = [
  { icon: Coins, text: 'Cuotas fijas mensuales' },
  { icon: Clock, text: 'Resultado inmediato' },
  { icon: Leaf, text: 'Bicicletas y motos eléctricas' },
] as const

/**
 * Entrada de la pagina: dice en una linea que hace la aplicacion y lleva al simulador.
 *
 * El CTA es un enlace al ancla del simulador, no un boton: navega, no ejecuta una accion, y asi
 * funciona con el teclado y el menu contextual como cualquier enlace.
 */
export function Hero({ targetId }: { targetId: string }) {
  return (
    <section className="border-b border-white/10 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold text-brand-400">Simulador de crédito</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Muévete en eléctrico y paga por cuotas claras
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
          Calcula en segundos cuánto pagarías cada mes por tu bicicleta o moto eléctrica, con el
          detalle de cada cuota antes de solicitar nada.
        </p>

        <a href={`#${targetId}`} className={`${buttonClasses('primary', 'lg')} mt-8`}>
          Simular mi crédito
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>

        <ul className="mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5">
              <Icon className="size-4 shrink-0 text-brand-400" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
