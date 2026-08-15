import { CalendarDays, Percent, Receipt, Wallet, type LucideIcon } from 'lucide-react'

import { Card } from '../../components/Card'
import { VEHICLE_TYPE_LABELS } from '../../schemas/simulationForm'
import type { SimulationResponse } from '../../types/api'
import { formatCop, formatRate } from '../../utils/format'

/**
 * Resumen del credito simulado, en tres niveles de jerarquia: la cuota mensual, las cuatro
 * cifras que definen la decision y el detalle de las condiciones.
 *
 * Todos los valores provienen de la respuesta del backend. Aqui no se calcula nada: ni una
 * resta, ni un porcentaje. Solo se formatean para leerse.
 */
export function CreditSummary({ simulation }: { simulation: SimulationResponse }) {
  const details: { label: string; value: string }[] = [
    { label: 'Vehículo', value: VEHICLE_TYPE_LABELS[simulation.vehicle_type] },
    { label: 'Valor del vehículo', value: formatCop(simulation.vehicle_value) },
    { label: 'Cuota inicial', value: formatCop(simulation.down_payment) },
    { label: 'Tasa efectiva anual', value: formatRate(simulation.annual_interest_rate) },
    { label: 'Tasa mensual equivalente', value: formatRate(simulation.monthly_interest_rate) },
  ]

  return (
    <section aria-labelledby="summary-title" className="space-y-3 motion-safe:animate-rise">
      <h2
        id="summary-title"
        className="text-xs font-semibold tracking-wider text-slate-500 uppercase"
      >
        Tu plan de crédito
      </h2>

      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-sm text-slate-300">Cuota mensual</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-brand-300 tabular-nums sm:text-5xl">
          {formatCop(simulation.monthly_payment)}
        </p>
        <p className="mt-3 text-sm text-slate-300">
          {simulation.term_months} cuotas fijas · Tasa {formatRate(simulation.annual_interest_rate)}{' '}
          efectiva anual
        </p>
        <p className="mt-1 text-xs text-slate-400">
          La última cuota puede variar unos centavos por el ajuste de redondeo.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Stat
          icon={Wallet}
          label="Valor financiado"
          value={formatCop(simulation.financed_amount)}
        />
        <Stat icon={CalendarDays} label="Plazo" value={`${simulation.term_months} meses`} />
        <Stat icon={Percent} label="Total intereses" value={formatCop(simulation.total_interest)} />
        <Stat icon={Receipt} label="Total a pagar" value={formatCop(simulation.total_payment)} />
      </dl>

      <Card title="Detalle de la simulación">
        <dl className="divide-y divide-slate-100">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-slate-600">{detail.label}</dt>
              <dd className="text-sm font-semibold text-slate-900 tabular-nums">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  )
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-2 text-lg font-semibold text-slate-900 tabular-nums">{value}</dd>
    </div>
  )
}
