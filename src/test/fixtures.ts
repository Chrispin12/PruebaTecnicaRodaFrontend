import type { CreditApplicationResponse, SimulationResponse } from '../types/api'

/**
 * Respuestas de ejemplo copiadas literalmente de la API real (moto electrica de $8.000.000
 * con $2.000.000 de cuota inicial a 6 meses). Se toman del backend y no se inventan para que
 * los tests fallen si el contrato cambia.
 */
export const simulationResponse: SimulationResponse = {
  vehicle_type: 'electric_motorcycle',
  vehicle_value: '8000000',
  down_payment: '2000000',
  financed_amount: '6000000.00',
  term_months: 6,
  annual_interest_rate: '0.24',
  monthly_interest_rate: '0.018088',
  monthly_payment: '1064252.04',
  total_interest: '385512.24',
  total_payment: '6385512.24',
  schedule: [
    {
      installment_number: 1,
      payment: '1064252.04',
      interest: '108525.49',
      principal: '955726.55',
      remaining_balance: '5044273.45',
    },
    {
      installment_number: 2,
      payment: '1064252.04',
      interest: '91238.71',
      principal: '973013.33',
      remaining_balance: '4071260.12',
    },
    {
      installment_number: 3,
      payment: '1064252.04',
      interest: '73639.25',
      principal: '990612.79',
      remaining_balance: '3080647.33',
    },
    {
      installment_number: 4,
      payment: '1064252.04',
      interest: '55721.46',
      principal: '1008530.58',
      remaining_balance: '2072116.75',
    },
    {
      installment_number: 5,
      payment: '1064252.04',
      interest: '37479.58',
      principal: '1026772.46',
      remaining_balance: '1045344.29',
    },
    {
      installment_number: 6,
      payment: '1064252.04',
      interest: '18907.75',
      principal: '1045344.29',
      remaining_balance: '0.00',
    },
  ],
}

export const creditApplicationResponse: CreditApplicationResponse = {
  id: '3f6d1a2e-8c4b-4f0a-9d3e-5b7c1f8a2d90',
  created_at: '2026-08-14T17:05:12.482913Z',
  first_name: 'Laura',
  last_name: 'Gomez',
  email: 'laura.gomez@example.com',
  phone: '3001234567',
  city: 'Bogota',
  vehicle_type: 'electric_motorcycle',
  vehicle_value: '8000000.00',
  down_payment: '2000000.00',
  financed_amount: '6000000.00',
  term_months: 6,
  annual_interest_rate: '0.240000',
  monthly_interest_rate: '0.018088',
  monthly_payment: '1064252.04',
  total_interest: '385512.24',
  total_payment: '6385512.24',
}
