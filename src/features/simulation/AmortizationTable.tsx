import { Card } from '../../components/Card'
import type { AmortizationInstallment } from '../../types/api'
import { formatCop } from '../../utils/format'

const MONEY_COLUMNS = ['Pago', 'Interés', 'Abono a capital', 'Saldo restante'] as const

const CELL_CLASSES = 'px-3 py-2.5 text-right tabular-nums whitespace-nowrap sm:px-4'

/**
 * Plan de pagos. Renderiza tal cual `schedule`: ningun valor se recalcula, se suma ni se
 * reordena.
 *
 * En pantallas pequenas la tabla no cabe: se desplaza en horizontal dentro de una region
 * enfocable con teclado, con el numero de cuota fijo a la izquierda para no perder la
 * referencia al desplazarse.
 */
export function AmortizationTable({ schedule }: { schedule: AmortizationInstallment[] }) {
  return (
    <Card
      title="Tabla de amortización"
      description={`Detalle de las ${schedule.length} cuotas: cuánto pagas de interés y cuánto abonas a la deuda.`}
    >
      <div
        role="region"
        aria-label="Tabla de amortización con desplazamiento horizontal"
        tabIndex={0}
        className="max-h-96 overflow-auto rounded-xl border border-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        <table className="w-full min-w-2xl border-collapse text-sm">
          <caption className="sr-only">
            Plan de pagos con interés, abono a capital y saldo restante de cada cuota
          </caption>
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs tracking-wider text-slate-500 uppercase">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-left font-semibold sm:px-4"
              >
                Cuota
              </th>
              {MONEY_COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-slate-200 px-3 py-2.5 text-right font-semibold whitespace-nowrap sm:px-4"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((installment) => (
              <tr key={installment.installment_number} className="group hover:bg-brand-50/60">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-3 py-2.5 text-left font-semibold text-slate-500 tabular-nums group-hover:bg-brand-50/60 sm:px-4"
                >
                  {installment.installment_number}
                </th>
                <td className={`${CELL_CLASSES} font-semibold text-slate-900`}>
                  {formatCop(installment.payment)}
                </td>
                <td className={`${CELL_CLASSES} text-slate-500`}>
                  {formatCop(installment.interest)}
                </td>
                <td className={`${CELL_CLASSES} text-slate-500`}>
                  {formatCop(installment.principal)}
                </td>
                <td className={`${CELL_CLASSES} text-slate-900`}>
                  {formatCop(installment.remaining_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
