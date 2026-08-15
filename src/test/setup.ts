import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

// `onUnhandledRequest: 'error'` hace fallar cualquier peticion que ningun handler cubra: si se
// agrega una llamada HTTP sin declararla, el test lo dice en lugar de colgarse.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())
