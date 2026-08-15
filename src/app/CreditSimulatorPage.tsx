import { useIsMutating } from '@tanstack/react-query'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'
import { ApplicationSuccess } from '../features/credit-application/ApplicationSuccess'
import { CreditApplicationForm } from '../features/credit-application/CreditApplicationForm'
import { AmortizationTable } from '../features/simulation/AmortizationTable'
import { CreditSummary } from '../features/simulation/CreditSummary'
import { SimulationForm } from '../features/simulation/SimulationForm'
import { SIMULATION_MUTATION_KEY } from '../features/simulation/useSimulationMutation'
import type { CreditApplicationResponse, SimulationResponse } from '../types/api'
import { AppHeader } from './AppHeader'
import { Hero } from './Hero'

const SIMULATOR_SECTION_ID = 'simulador'

/**
 * Orquesta el flujo simular -> revisar -> solicitar -> confirmar.
 *
 * El estado vive aqui, en la pagina, y no en un store global: son dos datos que solo importan
 * mientras el usuario esta en esta pantalla. `simulation` es ademas lo que habilita la
 * solicitud, de modo que sin una simulacion exitosa el formulario de registro no existe.
 */
export function CreditSimulatorPage() {
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null)
  const [application, setApplication] = useState<CreditApplicationResponse | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const isSimulating = useIsMutating({ mutationKey: SIMULATION_MUTATION_KEY }) > 0

  function handleSimulated(result: SimulationResponse) {
    // Una nueva simulacion invalida el paso en el que estaba el usuario: las condiciones
    // cambiaron, asi que la solicitud debe partir de cero.
    setSimulation(result)
    setApplication(null)
    setIsApplying(false)
  }

  function handleRestart() {
    setSimulation(null)
    setApplication(null)
    setIsApplying(false)
  }

  function renderResults() {
    if (isSimulating) {
      return <LoadingState message="Calculando tu plan de pagos..." />
    }

    if (!simulation) {
      return <EmptySummary />
    }

    return (
      <>
        <CreditSummary simulation={simulation} />
        {renderApplicationStep(simulation)}
      </>
    )
  }

  /** Paso en el que esta la solicitud: invitacion, formulario o confirmacion. */
  function renderApplicationStep(current: SimulationResponse) {
    if (application) {
      return <ApplicationSuccess application={application} onSimulateAgain={handleRestart} />
    }

    if (isApplying) {
      return (
        <CreditApplicationForm
          simulation={current}
          onRegistered={setApplication}
          onCancel={() => setIsApplying(false)}
        />
      )
    }

    return (
      <Card
        title="¿Quieres avanzar con esta financiación?"
        description="Déjanos tus datos y un asesor de Roda te contacta para continuar."
      >
        <Button size="lg" className="w-full" onClick={() => setIsApplying(true)}>
          Solicitar crédito
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <Hero targetId={SIMULATOR_SECTION_ID} />

      {/* `scroll-mt-16` deja sitio a la cabecera fija cuando el CTA del hero salta hasta aqui. */}
      <main
        id={SIMULATOR_SECTION_ID}
        className="mx-auto max-w-6xl scroll-mt-16 space-y-6 px-4 py-10 sm:px-6 sm:py-14"
      >
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          {/* El formulario no se fija con `sticky`: es mas alto que una pantalla de portatil y
              quedaria con la parte inferior inalcanzable. */}
          <SimulationForm onSimulated={handleSimulated} />

          {/* Sin `aria-live` en el contenedor: dentro ya hay un `role="status"` para la espera y
              anidar regiones vivas provoca anuncios duplicados en algunos lectores. */}
          <div className="space-y-3">{renderResults()}</div>
        </div>

        {!isSimulating && simulation && <AmortizationTable schedule={simulation.schedule} />}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 sm:px-6">
          Los valores son informativos y los calcula el servidor con amortización francesa y una
          tasa de demostración configurable. No constituyen una oferta comercial.
        </p>
      </footer>
    </div>
  )
}

function EmptySummary() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium text-slate-800">Aún no has simulado tu crédito</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Completa el formulario y te mostramos tu cuota mensual, el total a pagar y el detalle de
        cada cuota.
      </p>
    </div>
  )
}
