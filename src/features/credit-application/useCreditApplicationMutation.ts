import { useMutation } from '@tanstack/react-query'

import { createCreditApplication } from '../../services/api/creditApi'

/** Registrar la solicitud crea un recurso en el backend: es una mutacion en todo su sentido. */
export function useCreditApplicationMutation() {
  return useMutation({ mutationFn: createCreditApplication })
}
