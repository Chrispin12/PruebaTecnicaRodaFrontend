import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import type { ApiErrorDetail, ApiErrorResponse } from '../types/api'
import { creditApplicationResponse, simulationResponse } from './fixtures'

/** Debe coincidir con `VITE_API_URL` definida en `vite.config.ts` para los tests. */
const API_URL = 'http://api.test'

export const SIMULATIONS_URL = `${API_URL}/api/v1/simulations`
export const CREDIT_APPLICATIONS_URL = `${API_URL}/api/v1/credit-applications`

/**
 * Se intercepta a nivel de red (MSW) en lugar de simular el modulo del cliente HTTP: asi los
 * tests recorren tambien el `fetch` real, el parseo de la respuesta y la traduccion de errores.
 */
export const server = setupServer(
  http.post(SIMULATIONS_URL, () => HttpResponse.json(simulationResponse)),
  http.post(CREDIT_APPLICATIONS_URL, () =>
    HttpResponse.json(creditApplicationResponse, { status: 201 }),
  ),
)

/** Construye el sobre de error del backend. */
export function errorBody(
  code: string,
  message: string,
  details?: ApiErrorDetail[],
): ApiErrorResponse {
  return { error: { code, message, details } }
}
