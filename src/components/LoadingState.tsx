import { LoaderCircle } from 'lucide-react'

/**
 * Espera de una respuesta del servidor.
 *
 * En lugar de un indicador suelto se dibuja la silueta del resultado que va a llegar: el
 * usuario ve donde va a aparecer cada dato y el salto de layout es menor. `role="status"`
 * anuncia el mensaje sin interrumpir.
 */
export function LoadingState({ message }: { message: string }) {
  return (
    <div className="space-y-4">
      <div
        role="status"
        className="flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-6 text-sm text-slate-200"
      >
        <LoaderCircle
          className="size-5 text-brand-300 motion-safe:animate-spin"
          aria-hidden="true"
        />
        {message}
      </div>

      <div aria-hidden="true" className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="mt-3 h-5 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
