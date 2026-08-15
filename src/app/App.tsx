import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { CreditSimulatorPage } from './CreditSimulatorPage'
import { createQueryClient } from './queryClient'

export default function App() {
  // `useState` y no una constante de modulo: evita compartir cache entre renders del arbol y
  // deja el cliente listo para un futuro entorno de servidor.
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <CreditSimulatorPage />
    </QueryClientProvider>
  )
}
