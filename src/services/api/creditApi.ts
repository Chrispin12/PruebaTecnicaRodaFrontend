import type {
  CreditApplicationRequest,
  CreditApplicationResponse,
  SimulationRequest,
  SimulationResponse,
} from '../../types/api'
import { postJson } from './client'

const SIMULATIONS_PATH = '/api/v1/simulations'
const CREDIT_APPLICATIONS_PATH = '/api/v1/credit-applications'

/** Calcula el credito. No crea nada en el backend. */
export function createSimulation(request: SimulationRequest): Promise<SimulationResponse> {
  return postJson<SimulationResponse>(SIMULATIONS_PATH, request)
}

/** Registra la solicitud. El backend recalcula los valores financieros al guardarla. */
export function createCreditApplication(
  request: CreditApplicationRequest,
): Promise<CreditApplicationResponse> {
  return postJson<CreditApplicationResponse>(CREDIT_APPLICATIONS_PATH, request)
}
