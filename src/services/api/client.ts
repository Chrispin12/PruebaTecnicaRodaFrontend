/**
 * Cliente HTTP de la aplicacion.
 *
 * Unico lugar que hace `fetch`: centraliza la URL base, las cabeceras y la traduccion de
 * errores. Los componentes nunca llaman a la red directamente.
 *
 * Se usa `fetch` y no Axios: solo se necesitan dos POST con JSON, y el navegador ya lo trae.
 */

import type { ApiErrorDetail, ApiErrorResponse } from '../../types/api'
import { API_BASE_URL } from './config'

/** Mensaje unico para lo que no es culpa del usuario ni podemos explicar. */
export const GENERIC_ERROR_MESSAGE = 'No fue posible procesar la solicitud. Intenta nuevamente.'

/** Status sintetico para un fallo de red: la peticion no llego a obtener respuesta. */
export const NETWORK_ERROR_STATUS = 0

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** Regla de negocio incumplida: el mensaje del backend es apto para el usuario. */
  get isBusinessRule(): boolean {
    return this.status === 400
  }

  /** El request no cumple el contrato: `details` indica que campo falla. */
  get isValidation(): boolean {
    return this.status === 422
  }
}

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(NETWORK_ERROR_STATUS, 'NETWORK_ERROR', GENERIC_ERROR_MESSAGE)
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  return (await response.json()) as TResponse
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readErrorBody(response)

  // De un 5xx no se muestra nunca el cuerpo, ni siquiera el mensaje: el backend ya devuelve
  // uno generico, pero un proxy o un balanceador podrian responder con detalle interno.
  if (response.status >= 500 || !body) {
    return new ApiError(
      response.status,
      body?.error.code ?? 'INTERNAL_ERROR',
      GENERIC_ERROR_MESSAGE,
    )
  }

  return new ApiError(response.status, body.error.code, body.error.message, body.error.details)
}

async function readErrorBody(response: Response): Promise<ApiErrorResponse | null> {
  try {
    const body = (await response.json()) as unknown
    return isApiErrorResponse(body) ? body : null
  } catch {
    // Respuesta vacia o que no es JSON (por ejemplo, un HTML de error de un proxy).
    return null
  }
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return false
  }

  const error = (body as { error: unknown }).error
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  )
}
