import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement, ReactNode } from 'react'

import { createQueryClient } from '../app/queryClient'

/**
 * Monta un componente con las mismas dependencias que en produccion.
 *
 * Usa la fabrica real del `QueryClient` para que los tests validen tambien su configuracion,
 * y crea un cliente nuevo por test para no arrastrar estado entre casos.
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = createQueryClient()

  function Providers({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers }),
  }
}
