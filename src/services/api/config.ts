const DEVELOPMENT_FALLBACK_URL = 'http://localhost:8000'

const configuredUrl = import.meta.env.VITE_API_URL?.trim()

if (!configuredUrl && import.meta.env.PROD) {
  // En produccion es mejor fallar al arrancar que apuntar en silencio a localhost y dejar al
  // usuario con una aplicacion que no responde.
  throw new Error('VITE_API_URL no esta configurada.')
}

/** URL base de la API, sin barra final para poder concatenar rutas sin duplicarla. */
export const API_BASE_URL = (configuredUrl || DEVELOPMENT_FALLBACK_URL).replace(/\/+$/, '')
