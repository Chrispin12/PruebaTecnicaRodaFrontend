import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { HttpResponse, delay, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { creditApplicationResponse, simulationResponse } from '../test/fixtures'
import { renderWithProviders } from '../test/renderWithProviders'
import { CREDIT_APPLICATIONS_URL, SIMULATIONS_URL, errorBody, server } from '../test/server'
import type { CreditApplicationRequest } from '../types/api'
import { CreditSimulatorPage } from './CreditSimulatorPage'

const SIMULATE_BUTTON = 'Calcular mi cuota'
const APPLY_BUTTON = 'Solicitar crédito'
const SUBMIT_APPLICATION_BUTTON = 'Enviar solicitud'

function renderPage() {
  return renderWithProviders(<CreditSimulatorPage />)
}

async function simulate(user: UserEvent) {
  await user.type(screen.getByLabelText('Valor del vehículo'), '8000000')
  await user.clear(screen.getByLabelText('Cuota inicial'))
  await user.type(screen.getByLabelText('Cuota inicial'), '2000000')
  await user.click(screen.getByRole('radio', { name: '6 meses' }))
  await user.click(screen.getByRole('button', { name: SIMULATE_BUTTON }))
  await screen.findByText('Tu plan de crédito')
}

async function fillApplicant(user: UserEvent) {
  await user.type(screen.getByLabelText('Nombre'), 'Laura')
  await user.type(screen.getByLabelText('Apellido'), 'Gomez')
  await user.type(screen.getByLabelText('Número de documento'), '1023456789')
  await user.type(screen.getByLabelText('Correo electrónico'), 'laura.gomez@example.com')
  await user.type(screen.getByLabelText('Teléfono'), '3001234567')
  await user.type(screen.getByLabelText('Ciudad'), 'Bogota')
}

/** Devuelve las solicitudes que recibio el endpoint de registro. */
function captureApplications() {
  const requests: CreditApplicationRequest[] = []

  server.use(
    http.post(CREDIT_APPLICATIONS_URL, async ({ request }) => {
      requests.push((await request.json()) as CreditApplicationRequest)
      return HttpResponse.json(creditApplicationResponse, { status: 201 })
    }),
  )

  return requests
}

describe('CreditSimulatorPage', () => {
  it('parte de un estado vacio, sin resultado ni acceso a la solicitud', () => {
    renderPage()

    expect(screen.getByText('Aún no has simulado tu crédito')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: APPLY_BUTTON })).not.toBeInTheDocument()
  })

  it('anuncia que esta calculando mientras espera al backend', async () => {
    server.use(
      http.post(SIMULATIONS_URL, async () => {
        await delay(80)
        return HttpResponse.json(simulationResponse)
      }),
    )
    const { user } = renderPage()

    await user.type(screen.getByLabelText('Valor del vehículo'), '8000000')
    await user.click(screen.getByRole('button', { name: SIMULATE_BUTTON }))

    expect(await screen.findByRole('status')).toHaveTextContent('Calculando tu plan de pagos...')
    expect(await screen.findByText('Tu plan de crédito')).toBeInTheDocument()
  })

  it('muestra el resumen con los valores que devolvio el backend', async () => {
    const { user } = renderPage()

    await simulate(user)

    const summary = screen.getByText('Tu plan de crédito').closest('section')
    expect(summary).not.toBeNull()
    const values = within(summary as HTMLElement)

    expect(values.getByText('$1.064.252,04')).toBeInTheDocument()
    expect(values.getByText('$8.000.000')).toBeInTheDocument()
    expect(values.getByText('$2.000.000')).toBeInTheDocument()
    expect(values.getByText('$6.000.000')).toBeInTheDocument()
    expect(values.getByText('6 meses')).toBeInTheDocument()
    expect(values.getByText('24 %')).toBeInTheDocument()
    expect(values.getByText('1,8088 %')).toBeInTheDocument()
    expect(values.getByText('$385.512,24')).toBeInTheDocument()
    expect(values.getByText('$6.385.512,24')).toBeInTheDocument()
  })

  it('renderiza una fila por cuota del plan de pagos', async () => {
    const { user } = renderPage()

    await simulate(user)

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(simulationResponse.schedule.length + 1)

    const firstInstallment = within(rows[1] as HTMLElement)
    expect(firstInstallment.getByText('$108.525,49')).toBeInTheDocument()
    expect(firstInstallment.getByText('$955.726,55')).toBeInTheDocument()
    expect(firstInstallment.getByText('$5.044.273,45')).toBeInTheDocument()

    const lastInstallment = within(rows[rows.length - 1] as HTMLElement)
    expect(lastInstallment.getByText('$0')).toBeInTheDocument()
  })

  it('muestra el mensaje del backend cuando incumple una regla de negocio (400)', async () => {
    const message = 'El valor del vehiculo debe ser mayor o igual a $500.000 COP.'
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.json(errorBody('BUSINESS_RULE_VIOLATION', message), { status: 400 }),
      ),
    )
    const { user } = renderPage()

    await user.type(screen.getByLabelText('Valor del vehículo'), '100000')
    await user.click(screen.getByRole('button', { name: SIMULATE_BUTTON }))

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByText('Aún no has simulado tu crédito')).toBeInTheDocument()
  })

  it('asocia al campo el detalle de un error de validacion (422)', async () => {
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.json(
          errorBody('VALIDATION_ERROR', 'Los datos enviados no son validos.', [
            { field: 'down_payment', message: 'La cuota inicial no puede superar el valor.' },
          ]),
          { status: 422 },
        ),
      ),
    )
    const { user } = renderPage()

    await user.type(screen.getByLabelText('Valor del vehículo'), '8000000')
    await user.click(screen.getByRole('button', { name: SIMULATE_BUTTON }))

    expect(
      await screen.findByText('La cuota inicial no puede superar el valor.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Cuota inicial')).toHaveAttribute('aria-invalid', 'true')
  })

  it('muestra un mensaje amigable ante un error inesperado (500)', async () => {
    server.use(
      http.post(SIMULATIONS_URL, () =>
        HttpResponse.json(errorBody('INTERNAL_ERROR', 'psycopg.errors.UndefinedColumn: rate'), {
          status: 500,
        }),
      ),
    )
    const { user } = renderPage()

    await user.type(screen.getByLabelText('Valor del vehículo'), '8000000')
    await user.click(screen.getByRole('button', { name: SIMULATE_BUTTON }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible procesar la solicitud. Intenta nuevamente.',
    )
    expect(screen.queryByText(/psycopg/)).not.toBeInTheDocument()
  })

  it('habilita la solicitud solo despues de una simulacion exitosa', async () => {
    const { user } = renderPage()

    expect(screen.queryByRole('button', { name: APPLY_BUTTON })).not.toBeInTheDocument()

    await simulate(user)

    expect(screen.getByRole('button', { name: APPLY_BUTTON })).toBeEnabled()
  })

  it('pide solo los datos del solicitante y registra la solicitud', async () => {
    const requests = captureApplications()
    const { user } = renderPage()

    await simulate(user)
    await user.click(screen.getByRole('button', { name: APPLY_BUTTON }))

    expect(screen.getByLabelText('Número de documento')).toBeInTheDocument()
    expect(screen.queryByLabelText(/contrasena/i)).not.toBeInTheDocument()

    await fillApplicant(user)
    await user.click(screen.getByRole('button', { name: SUBMIT_APPLICATION_BUTTON }))

    await waitFor(() => expect(requests).toHaveLength(1))
    // Se envian los datos del solicitante y las condiciones de la simulacion, nunca la cuota,
    // los intereses ni los totales: esos los recalcula el backend.
    expect(requests[0]).toEqual({
      first_name: 'Laura',
      last_name: 'Gomez',
      document_type: 'cc',
      document_number: '1023456789',
      email: 'laura.gomez@example.com',
      phone: '3001234567',
      city: 'Bogota',
      vehicle_type: 'electric_motorcycle',
      vehicle_value: '8000000',
      down_payment: '2000000',
      term_months: 6,
    })
  })

  it('confirma la solicitud registrada con los datos que devolvio el backend', async () => {
    const { user } = renderPage()

    await simulate(user)
    await user.click(screen.getByRole('button', { name: APPLY_BUTTON }))
    await fillApplicant(user)
    await user.click(screen.getByRole('button', { name: SUBMIT_APPLICATION_BUTTON }))

    expect(await screen.findByText('Solicitud enviada')).toBeInTheDocument()
    expect(screen.getByText(creditApplicationResponse.id)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: SUBMIT_APPLICATION_BUTTON }),
    ).not.toBeInTheDocument()
  })

  it('valida los datos del solicitante antes de registrar', async () => {
    const requests = captureApplications()
    const { user } = renderPage()

    await simulate(user)
    await user.click(screen.getByRole('button', { name: APPLY_BUTTON }))
    await user.type(screen.getByLabelText('Nombre'), '   ')
    await user.type(screen.getByLabelText('Correo electrónico'), 'laura@')
    await user.type(screen.getByLabelText('Teléfono'), '300-123')
    await user.click(screen.getByRole('button', { name: SUBMIT_APPLICATION_BUTTON }))

    expect(await screen.findByText('Ingresa tu nombre.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu número de documento.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu apellido.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
    expect(
      screen.getByText('Ingresa entre 7 y 15 dígitos, sin espacios ni guiones.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu ciudad.')).toBeInTheDocument()
    expect(requests).toHaveLength(0)
  })

  it('no registra dos veces la misma solicitud', async () => {
    const requests: CreditApplicationRequest[] = []
    server.use(
      http.post(CREDIT_APPLICATIONS_URL, async ({ request }) => {
        requests.push((await request.json()) as CreditApplicationRequest)
        await delay(80)
        return HttpResponse.json(creditApplicationResponse, { status: 201 })
      }),
    )
    const { user } = renderPage()

    await simulate(user)
    await user.click(screen.getByRole('button', { name: APPLY_BUTTON }))
    await fillApplicant(user)

    const submit = screen.getByRole('button', { name: SUBMIT_APPLICATION_BUTTON })
    await user.click(submit)
    await user.click(submit)

    expect(await screen.findByText('Solicitud enviada')).toBeInTheDocument()
    expect(requests).toHaveLength(1)
  })

  it('descarta la solicitud registrada al simular de nuevo', async () => {
    const { user } = renderPage()

    await simulate(user)
    await user.click(screen.getByRole('button', { name: APPLY_BUTTON }))
    await fillApplicant(user)
    await user.click(screen.getByRole('button', { name: SUBMIT_APPLICATION_BUTTON }))
    await screen.findByText('Solicitud enviada')

    await user.click(screen.getByRole('button', { name: SIMULATE_BUTTON }))

    await waitFor(() => expect(screen.queryByText('Solicitud enviada')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: APPLY_BUTTON })).toBeInTheDocument()
  })
})
