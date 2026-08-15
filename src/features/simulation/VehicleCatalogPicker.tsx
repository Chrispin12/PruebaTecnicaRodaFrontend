import { Bike, Motorbike, type LucideIcon } from 'lucide-react'

import type { VehicleType } from '../../types/api'
import { formatCop } from '../../utils/format'
import { CATALOG_BY_TYPE, CATALOG_SECTIONS, type CatalogVehicle } from './vehicleCatalog'

const TYPE_ICONS: Record<VehicleType, LucideIcon> = {
  electric_bicycle: Bike,
  electric_motorcycle: Motorbike,
}

interface VehicleCatalogPickerProps {
  selectedId: string | null
  onSelect: (vehicle: CatalogVehicle) => void
}

/**
 * Atajos de demostracion: al elegir un modelo se copian precio, cuota inicial y plazo
 * al formulario. El usuario puede seguir editando a mano despues.
 */
export function VehicleCatalogPicker({ selectedId, onSelect }: VehicleCatalogPickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">Modelos de ejemplo</legend>
      <p className="mt-1 text-xs text-slate-500">
        Elige un modelo para rellenar precio y cuota mínima. Después puedes subir la inicial y
        cambiar el plazo.
      </p>

      <div className="mt-3 space-y-4">
        {CATALOG_SECTIONS.map((section) => {
          const SectionIcon = TYPE_ICONS[section.type]

          return (
            <div key={section.type}>
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <SectionIcon className="size-3.5 text-brand-700" aria-hidden="true" />
                {section.title}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {CATALOG_BY_TYPE[section.type].map((vehicle) => {
                  const selected = vehicle.id === selectedId
                  const Icon = TYPE_ICONS[vehicle.vehicle_type]

                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(vehicle)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
                        selected
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`mb-2 flex size-9 items-center justify-center rounded-lg ${
                          selected ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'
                        }`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {vehicle.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">{vehicle.summary}</span>
                      <span className="mt-1.5 block text-sm font-semibold tabular-nums text-slate-900">
                        {formatCop(vehicle.vehicle_value)}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Inicial {formatCop(vehicle.down_payment)} · {vehicle.term_months} meses
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
