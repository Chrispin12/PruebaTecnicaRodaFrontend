import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { HttpResponse, delay, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { simulationResponse } from '../../test/fixtures'
import { renderWithProviders } from '../../test/renderWithProviders'
import { SIMULATIONS_URL, server } from '../../test/server'
import type { SimulationRequest } from '../../types/api'
import { SimulationForm } from './SimulationForm'

function renderForm() {
  const onSimulated = vi.fn()
  return { onSimulated, ...renderWithProviders(<SimulationForm onSimulated={onSimulated} />) }
}

/** Registra lo que recibe el backend para poder afirmar sobre el cuerpo enviado. */
function captureRequests(responder?: () => Promise<Response> | Response) {
  const requests: SimulationRequest[] = []

  server.use(
    http.post(SIMULATIONS_URL, async ({ request }) => {
      requests.push((await request.json()) as SimulationRequest)
      return responder ? responder() : HttpResponse.json(simulationResponse)
    }),
  )

  return requests
}

async function fillForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Valor del vehículo'), '8000000')
  await user.clear(screen.getByLabelText('Cuota inicial'))
  await user.type(screen.getByLabelText('Cuota inicial'), '2000000')
  await user.click(screen.getByRole('radio', { name: '6 meses' }))
}

describe('SimulationForm', () => {
  it('muestra los campos necesarios para simular', () => {
    renderForm()

    expect(screen.getByRole('group', { name: 'Tipo de vehículo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Valor del vehículo')).toBeInTheDocument()
    expect(screen.getByLabelText('Cuota inicial')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Plazo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calcular mi cuota' })).toBeEnabled()
  })

  it('ofrece unicamente bicicleta y moto electrica, con la moto preseleccionada', () => {
    renderForm()

    const vehicleOptions = within(
      screen.getByRole('group', { name: 'Tipo de vehículo' }),
    ).getAllByRole('radio')

    expect(vehicleOptions.map((option) => (option as HTMLInputElement).value)).toEqual([
      'electric_bicycle',
      'electric_motorcycle',
    ])
    expect(screen.getByRole('radio', { name: 'Moto eléctrica' })).toBeChecked()
  })

  it('ofrece tres modelos de ejemplo por tipo de vehiculo', () => {
    renderForm()

    expect(screen.getByRole('group', { name: 'Modelos de ejemplo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Andina Urbana/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Andina Carga/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Andina Ruta/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rayo Compacta/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rayo Trabajo/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rayo Plus/ })).toBeInTheDocument()
  })

  it('rellena valor, cuota inicial y plazo al elegir un modelo de ejemplo', async () => {
    const requests = captureRequests()
    const { user, onSimulated } = renderForm()

    await user.click(screen.getByRole('button', { name: /Rayo Trabajo/ }))
    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    await waitFor(() => expect(onSimulated).toHaveBeenCalled())
    expect(requests).toEqual([
      {
        vehicle_type: 'electric_motorcycle',
        vehicle_value: '8000000',
        down_payment: '2000000',
        term_months: 24,
      },
    ])
  })

  it('permite subir la cuota inicial y cambiar el plazo de un modelo de ejemplo', async () => {
    const requests = captureRequests()
    const { user, onSimulated } = renderForm()

    await user.click(screen.getByRole('button', { name: /Andina Urbana/ }))
    await user.clear(screen.getByLabelText('Cuota inicial'))
    await user.type(screen.getByLabelText('Cuota inicial'), '700000')
    await user.click(screen.getByRole('radio', { name: '18 meses' }))
    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    await waitFor(() => expect(onSimulated).toHaveBeenCalled())
    expect(requests).toEqual([
      {
        vehicle_type: 'electric_bicycle',
        vehicle_value: '2800000',
        down_payment: '700000',
        term_months: 18,
      },
    ])
    expect(screen.getByRole('button', { name: /Andina Urbana/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('avisa si la cuota inicial queda por debajo del minimo del modelo', async () => {
    const requests = captureRequests()
    const { user, onSimulated } = renderForm()

    await user.click(screen.getByRole('button', { name: /Andina Urbana/ }))
    await user.clear(screen.getByLabelText('Cuota inicial'))
    await user.type(screen.getByLabelText('Cuota inicial'), '100000')
    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    expect(
      await screen.findByText('La cuota inicial mínima de este vehículo es $400.000.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Cuota inicial')).toHaveValue('100.000')
    expect(requests).toHaveLength(0)
    expect(onSimulated).not.toHaveBeenCalled()
  })

  it('permite simular sin cuota inicial marcando la casilla', async () => {
    const requests = captureRequests()
    const { user, onSimulated } = renderForm()

    await user.click(screen.getByRole('button', { name: /Andina Urbana/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Deseo proceder sin cuota inicial' }))
    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    await waitFor(() => expect(onSimulated).toHaveBeenCalled())
    expect(requests[0]).toMatchObject({
      vehicle_type: 'electric_bicycle',
      vehicle_value: '2800000',
      down_payment: '0',
    })
  })

  it('agrupa los miles mientras se escribe el importe', async () => {
    const { user } = renderForm()

    await user.type(screen.getByLabelText('Valor del vehículo'), '8000000')

    expect(screen.getByLabelText('Valor del vehículo')).toHaveValue('8.000.000')
  })

  it('exige el valor del vehiculo antes de llamar al backend', async () => {
    const requests = captureRequests()
    const { user, onSimulated } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    expect(await screen.findByText('Ingresa el valor del vehículo.')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor del vehículo')).toHaveAttribute('aria-invalid', 'true')
    expect(requests).toHaveLength(0)
    expect(onSimulated).not.toHaveBeenCalled()
  })

  it('envia solo las condiciones del credito, nunca valores financieros', async () => {
    const requests = captureRequests()
    const { user, onSimulated } = renderForm()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    await waitFor(() => expect(onSimulated).toHaveBeenCalledWith(simulationResponse))
    expect(requests).toEqual([
      {
        vehicle_type: 'electric_motorcycle',
        vehicle_value: '8000000',
        down_payment: '2000000',
        term_months: 6,
      },
    ])
  })

  it('bloquea el boton y avisa mientras calcula', async () => {
    captureRequests(async () => {
      await delay(80)
      return HttpResponse.json(simulationResponse)
    })
    const { user } = renderForm()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Calcular mi cuota' }))

    expect(await screen.findByRole('button', { name: 'Calculando...' })).toBeDisabled()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Calcular mi cuota' })).toBeEnabled(),
    )
  })

  it('no envia dos veces la misma simulacion', async () => {
    const requests = captureRequests(async () => {
      await delay(80)
      return HttpResponse.json(simulationResponse)
    })
    const { user, onSimulated } = renderForm()

    await fillForm(user)
    const submit = screen.getByRole('button', { name: 'Calcular mi cuota' })
    await user.click(submit)
    await user.click(submit)

    await waitFor(() => expect(onSimulated).toHaveBeenCalledTimes(1))
    expect(requests).toHaveLength(1)
  })
})
