import { useMutation } from '@tanstack/react-query'

import { createSimulation } from '../../services/api/creditApi'

/** Clave con la que la pagina consulta si hay una simulacion en curso (`useIsMutating`). */
export const SIMULATION_MUTATION_KEY = ['simulation'] as const

/**
 * Simular no crea nada en el servidor, pero se modela como mutacion y no como query: se
 * dispara cuando el usuario envia el formulario, no al montar, y no hay nada que cachear por
 * clave porque el resultado depende de un formulario que el usuario esta editando.
 */
export function useSimulationMutation() {
  return useMutation({
    mutationKey: SIMULATION_MUTATION_KEY,
    mutationFn: createSimulation,
  })
}
