import { QueryClient } from '@tanstack/react-query'

/**
 * Cliente de TanStack Query.
 *
 * La aplicacion solo tiene mutaciones (simular y solicitar), asi que no hay cache que ajustar.
 * Se deja `retry: false` explicito: reintentar un POST de solicitud podria duplicar el
 * registro, y reintentar en silencio una simulacion solo alarga la espera del usuario.
 *
 * Es una fabrica y no una instancia global para que cada test arranque con estado limpio.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  })
}
