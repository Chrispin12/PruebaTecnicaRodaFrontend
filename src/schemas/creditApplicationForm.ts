/**
 * Contrato del formulario de solicitud (RF-05).
 *
 * Solo pide los datos del solicitante. Los valores financieros no se piden ni se envian desde
 * el formulario: vienen de la simulacion y el backend los recalcula al registrar.
 *
 * Los formatos de correo y telefono se validan aqui para dar respuesta inmediata y evitar un
 * viaje al servidor; el backend los vuelve a validar y sigue siendo la autoridad.
 */

import { z } from 'zod'
import type { Applicant, CreditApplicationRequest, SimulationResponse } from '../types/api'

const NAME_MAX_LENGTH = 80
const EMAIL_MAX_LENGTH = 255
const CITY_MAX_LENGTH = 80

/** Numero de 7 a 15 digitos con prefijo internacional opcional, sin separadores. */
const PHONE_PATTERN = /^\+?\d{7,15}$/

const requiredName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa tu ${label}.`)
    .max(NAME_MAX_LENGTH, `Máximo ${NAME_MAX_LENGTH} caracteres.`)

export const creditApplicationFormSchema = z.object({
  first_name: requiredName('nombre'),
  last_name: requiredName('apellido'),
  email: z
    .email('Ingresa un correo electrónico válido.')
    .max(EMAIL_MAX_LENGTH, `Máximo ${EMAIL_MAX_LENGTH} caracteres.`),
  phone: z
    .string()
    .trim()
    .min(1, 'Ingresa tu teléfono.')
    .regex(PHONE_PATTERN, 'Ingresa entre 7 y 15 dígitos, sin espacios ni guiones.'),
  city: z
    .string()
    .trim()
    .min(1, 'Ingresa tu ciudad.')
    .max(CITY_MAX_LENGTH, `Máximo ${CITY_MAX_LENGTH} caracteres.`),
})

export type CreditApplicationFormValues = z.infer<typeof creditApplicationFormSchema>

export const CREDIT_APPLICATION_FORM_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'city',
] as const satisfies readonly (keyof CreditApplicationFormValues)[]

export const CREDIT_APPLICATION_FORM_DEFAULTS: CreditApplicationFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
}

/**
 * Combina los datos del solicitante con las condiciones de la simulacion.
 *
 * Las condiciones se toman de la respuesta del backend y no del formulario: asi se registra
 * exactamente lo que el usuario vio, aunque haya cambiado los campos despues de simular.
 */
export function toCreditApplicationRequest(
  applicant: Applicant,
  simulation: SimulationResponse,
): CreditApplicationRequest {
  // Se listan los campos uno a uno en lugar de esparcir `applicant`: un `spread` copiaria
  // tambien cualquier campo que el formulario llegue a tener y que la API no acepte.
  return {
    first_name: applicant.first_name,
    last_name: applicant.last_name,
    email: applicant.email,
    phone: applicant.phone,
    city: applicant.city,
    vehicle_type: simulation.vehicle_type,
    vehicle_value: simulation.vehicle_value,
    down_payment: simulation.down_payment,
    term_months: simulation.term_months,
  }
}
