/**
 * Contrato de la API de credito.
 *
 * Los nombres estan en snake_case porque son los del backend: traducirlos a camelCase
 * obligaria a mantener un mapeo en los dos sentidos sin ganar nada, y ademas hace que los
 * errores de validacion (que llegan con el nombre del campo) se puedan asociar directamente
 * al campo del formulario.
 *
 * Los importes y las tasas son `string`. El backend serializa `Decimal` como cadena para que
 * el valor llegue exacto; convertirlo a `number` lo pasaria por un float de doble precision.
 * En el frontend solo se formatean para mostrarlos, nunca se opera con ellos.
 */

export type VehicleType = 'electric_bicycle' | 'electric_motorcycle'

export interface SimulationRequest {
  vehicle_type: VehicleType
  vehicle_value: string
  down_payment: string
  term_months: number
}

export interface AmortizationInstallment {
  installment_number: number
  payment: string
  interest: string
  principal: string
  remaining_balance: string
}

export interface SimulationResponse {
  vehicle_type: VehicleType
  vehicle_value: string
  down_payment: string
  financed_amount: string
  term_months: number
  annual_interest_rate: string
  monthly_interest_rate: string
  monthly_payment: string
  total_interest: string
  total_payment: string
  schedule: AmortizationInstallment[]
}

export type DocumentType = 'cc' | 'ce' | 'passport'

export interface Applicant {
  first_name: string
  last_name: string
  document_type: DocumentType
  document_number: string
  email: string
  phone: string
  city: string
}

export type CreditApplicationRequest = Applicant & SimulationRequest

/** La solicitud registrada. No incluye el plan de pagos: se obtiene al simular. */
export type CreditApplicationResponse = Applicant &
  Omit<SimulationResponse, 'schedule'> & {
    id: string
    customer_id: string
    created_at: string
  }

export interface ApiErrorDetail {
  field: string
  message: string
}

/** Sobre unico de error del backend: `{ "error": { code, message, details? } }`. */
export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}
