/**
 * Contrato del formulario de solicitud (RF-05).
 *
 * Solo pide los datos del solicitante. Los valores financieros no se piden ni se envian desde
 * el formulario: vienen de la simulacion y el backend los recalcula al registrar.
 */

import { z } from 'zod'
import type { Applicant, CreditApplicationRequest, SimulationResponse } from '../types/api'

const NAME_MAX_LENGTH = 80
const EMAIL_MAX_LENGTH = 255
const CITY_MAX_LENGTH = 80

const PHONE_PATTERN = /^\+?\d{7,15}$/
const CC_PATTERN = /^\d{6,10}$/
const CE_PATTERN = /^[A-Z0-9]{6,12}$/
const PASSPORT_PATTERN = /^[A-Z0-9]{5,15}$/

const requiredName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa tu ${label}.`)
    .max(NAME_MAX_LENGTH, `Máximo ${NAME_MAX_LENGTH} caracteres.`)

export const creditApplicationFormSchema = z
  .object({
    first_name: requiredName('nombre'),
    last_name: requiredName('apellido'),
    document_type: z.enum(['cc', 'ce', 'passport'], {
      error: 'Selecciona el tipo de documento.',
    }),
    document_number: z.string().trim().min(1, 'Ingresa tu número de documento.'),
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
  .superRefine((values, ctx) => {
    const number = values.document_number.toUpperCase().replace(/[\s.-]/g, '')
    const ok =
      values.document_type === 'cc'
        ? CC_PATTERN.test(number)
        : values.document_type === 'ce'
          ? CE_PATTERN.test(number)
          : PASSPORT_PATTERN.test(number)
    if (!ok) {
      ctx.addIssue({
        code: 'custom',
        path: ['document_number'],
        message: 'Revisa el número: CC 6-10 dígitos; CE 6-12; pasaporte 5-15.',
      })
    }
  })
  .transform((values) => ({
    ...values,
    document_number: values.document_number.toUpperCase().replace(/[\s.-]/g, ''),
  }))

export type CreditApplicationFormValues = z.input<typeof creditApplicationFormSchema>

export const CREDIT_APPLICATION_FORM_FIELDS = [
  'first_name',
  'last_name',
  'document_type',
  'document_number',
  'email',
  'phone',
  'city',
] as const satisfies readonly (keyof CreditApplicationFormValues)[]

export const CREDIT_APPLICATION_FORM_DEFAULTS: CreditApplicationFormValues = {
  first_name: '',
  last_name: '',
  document_type: 'cc',
  document_number: '',
  email: '',
  phone: '',
  city: '',
}

export function toCreditApplicationRequest(
  applicant: Applicant,
  simulation: SimulationResponse,
): CreditApplicationRequest {
  return {
    first_name: applicant.first_name,
    last_name: applicant.last_name,
    document_type: applicant.document_type,
    document_number: applicant.document_number,
    email: applicant.email,
    phone: applicant.phone,
    city: applicant.city,
    vehicle_type: simulation.vehicle_type,
    vehicle_value: simulation.vehicle_value,
    down_payment: simulation.down_payment,
    term_months: simulation.term_months,
  }
}
