import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Aviso de error. `role="alert"` para que los lectores de pantalla lo anuncien al aparecer.
 *
 * Recibe siempre texto ya preparado para el usuario: nunca se renderiza HTML de una respuesta.
 */
export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
