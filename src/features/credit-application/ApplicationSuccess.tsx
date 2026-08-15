import { CircleCheckBig } from 'lucide-react'

import { Button } from '../../components/Button'
import type { CreditApplicationResponse } from '../../types/api'
import { formatCop, formatDateTime } from '../../utils/format'

interface ApplicationSuccessProps {
  application: CreditApplicationResponse
  onSimulateAgain: () => void
}

/** Confirmacion de la solicitud registrada, con lo que el backend dejo almacenado. */
export function ApplicationSuccess({ application, onSimulateAgain }: ApplicationSuccessProps) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: 'Número de solicitud', value: application.id, mono: true },
    { label: 'Fecha de registro', value: formatDateTime(application.created_at) },
    { label: 'Cuota mensual registrada', value: formatCop(application.monthly_payment) },
  ]

  return (
    <section
      aria-labelledby="application-success-title"
      className="rounded-2xl border border-brand-200 bg-brand-50 p-6 motion-safe:animate-rise"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-700 text-white motion-safe:animate-pop">
        <CircleCheckBig className="size-6" aria-hidden="true" />
      </span>

      <h2 id="application-success-title" className="mt-4 text-lg font-semibold text-brand-950">
        Solicitud enviada
      </h2>
      <p className="mt-1 text-sm text-brand-900">
        {application.first_name}, recibimos tu solicitud. Nuestro equipo te contactará al correo{' '}
        <span className="font-medium">{application.email}</span>.
      </p>

      <dl className="mt-5 space-y-2.5 border-t border-brand-200 pt-4 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-brand-900">{row.label}</dt>
            <dd
              className={
                row.mono
                  ? 'font-mono text-xs text-brand-950'
                  : 'font-semibold text-brand-950 tabular-nums'
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Button variant="secondary" className="mt-5 w-full" onClick={onSimulateAgain}>
        Hacer otra simulación
      </Button>
    </section>
  )
}
