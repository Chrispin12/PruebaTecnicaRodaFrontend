import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { simulationResponse } from '../../test/fixtures'
import { SIMULATIONS_URL, errorBody, server } from '../../test/server'
import type { SimulationRequest, SimulationResponse } from '../../types/api'
import { ApiError, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_STATUS, postJson } from './client'

const request: SimulationRequest = {
  vehicle_type: 'electric_motorcycle',
  vehicle_value: '8000000',
  down_payment: '2000000',
  term_months: 6,
}

async function postSimulation() {
  return postJson<SimulationResponse>('/api/v1/simulations', request)
}

describe('postJson', () => {
  it('envia JSON a la URL configurada y devuelve la respuesta tipada', async () => {
    let sentBody: unknown
    let contentType: string | null = null

    server.use(
      http.post(SIMULATIONS_URL, async ({ request: received }) => {
        contentType = received.headers.get('Content-Type')
        sentBody = await received.json()
        return HttpResponse.json(simulationResponse)
      }),
    )

    const result = await postSimulation()

    expect(contentType).toBe('application/json')
    expect(sentBody).toEqual(request)
    expect(result).toEqual(simulationResponse)
  })

  it('convierte un 400 en un error de negocio con el mensaje del backend', async () => {
    const message = 'El valor del vehiculo debe ser mayor o igual a $500.000 COP.'
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.json(errorBody('BUSINESS_RULE_VIOLATION', message), { status: 400 }),
      ),
    )

    const error = await postSimulation().catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message, code: 'BUSINESS_RULE_VIOLATION' })
    expect((error as ApiError).isBusinessRule).toBe(true)
  })

  it('conserva los detalles por campo de un 422', async () => {
    const details = [{ field: 'down_payment', message: 'Input should be greater than 0' }]
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.json(errorBody('VALIDATION_ERROR', 'Datos invalidos', details), {
          status: 422,
        }),
      ),
    )

    const error = (await postSimulation().catch((caught: unknown) => caught)) as ApiError

    expect(error.isValidation).toBe(true)
    expect(error.details).toEqual(details)
  })

  it('oculta el cuerpo de un 500 detras de un mensaje generico', async () => {
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.json(errorBody('INTERNAL_ERROR', 'psycopg.errors.UndefinedTable'), {
          status: 500,
        }),
      ),
    )

    const error = (await postSimulation().catch((caught: unknown) => caught)) as ApiError

    expect(error.status).toBe(500)
    expect(error.message).toBe(GENERIC_ERROR_MESSAGE)
  })

  it('devuelve el mensaje generico si la respuesta de error no es JSON', async () => {
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.text('<html>502 Bad Gateway</html>', { status: 502 }),
      ),
    )

    const error = (await postSimulation().catch((caught: unknown) => caught)) as ApiError

    expect(error.message).toBe(GENERIC_ERROR_MESSAGE)
  })

  it('trata un fallo de red como error generico', async () => {
    server.use(http.post(SIMULATIONS_URL, () => HttpResponse.error()))

    const error = (await postSimulation().catch((caught: unknown) => caught)) as ApiError

    expect(error.status).toBe(NETWORK_ERROR_STATUS)
    expect(error.message).toBe(GENERIC_ERROR_MESSAGE)
  })
})
