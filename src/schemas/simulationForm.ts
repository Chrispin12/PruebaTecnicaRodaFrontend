/**
 * Contrato del formulario de simulacion.
 *
 * Valida solo lo estructural y de UX: campos obligatorios, digitos y positividad. Los limites
 * de negocio (valor minimo del vehiculo, plazo maximo, tope de tasa) NO se replican aqui: son
 * del backend, y duplicarlos garantizaria que algun dia dejen de coincidir.
 */

import { z } from 'zod'
import type { SimulationRequest, VehicleType } from '../types/api'

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  electric_bicycle: 'Bicicleta eléctrica',
  electric_motorcycle: 'Moto eléctrica',
}

const VEHICLE_TYPE_VALUES = Object.keys(VEHICLE_TYPE_LABELS) as [VehicleType, ...VehicleType[]]

export const VEHICLE_TYPE_OPTIONS = VEHICLE_TYPE_VALUES.map((value) => ({
  value,
  label: VEHICLE_TYPE_LABELS[value],
}))

/**
 * Plazos ofrecidos. Es una decision de producto para simplificar la eleccion, no el rango que
 * acepta el backend: cualquier valor fuera de su rango lo rechazaria el dominio de todas formas.
 */
export const TERM_MONTHS_OPTIONS = [6, 12, 18, 24, 36, 48, 60].map((months) => ({
  value: String(months),
  label: `${months} meses`,
}))

const DIGITS_ONLY = /^\d+$/

export const simulationFormSchema = z.object({
  vehicle_type: z.enum(VEHICLE_TYPE_VALUES),
  vehicle_value: z
    .string()
    .min(1, 'Ingresa el valor del vehículo.')
    .regex(DIGITS_ONLY, 'Ingresa solo números.')
    .refine((value) => Number(value) > 0, 'El valor debe ser mayor que cero.'),
  down_payment: z
    .string()
    .min(1, 'Ingresa la cuota inicial. Escribe 0 si no vas a dar una.')
    .regex(DIGITS_ONLY, 'Ingresa solo números.'),
  term_months: z.string().min(1, 'Selecciona el plazo.'),
})

export type SimulationFormValues = z.infer<typeof simulationFormSchema>

export const SIMULATION_FORM_FIELDS = [
  'vehicle_type',
  'vehicle_value',
  'down_payment',
  'term_months',
] as const satisfies readonly (keyof SimulationFormValues)[]

export const SIMULATION_FORM_DEFAULTS: SimulationFormValues = {
  vehicle_type: 'electric_motorcycle',
  vehicle_value: '',
  down_payment: '0',
  term_months: '24',
}

/** Adapta los valores del formulario (todos texto) al contrato de la API. */
export function toSimulationRequest(values: SimulationFormValues): SimulationRequest {
  return {
    vehicle_type: values.vehicle_type,
    vehicle_value: values.vehicle_value,
    down_payment: values.down_payment,
    term_months: Number(values.term_months),
  }
}
