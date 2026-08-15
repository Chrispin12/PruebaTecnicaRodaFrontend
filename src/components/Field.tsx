import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithRef, ReactNode } from 'react'

const CONTROL_CLASSES =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-xs transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

interface FieldLayoutProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

/**
 * Estructura comun de un campo: etiqueta asociada, control, ayuda y error.
 *
 * Existe para que los campos de la aplicacion no repitan el marcado ni el cableado de
 * accesibilidad. La ayuda se oculta cuando hay error para no competir con el mensaje.
 */
function FieldLayout({ id, label, hint, error, children }: FieldLayoutProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

interface SelectFieldProps extends Omit<ComponentPropsWithRef<'select'>, 'id' | 'className'> {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

export function SelectField({
  id,
  label,
  hint,
  error,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <FieldLayout id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL_CLASSES} text-sm`}
        {...props}
      >
        {children}
      </select>
    </FieldLayout>
  )
}

interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'id' | 'className'> {
  id: string
  label: string
  hint?: string
  error?: string
  /** Adorno fijo dentro del control, por ejemplo el signo de pesos. */
  prefix?: string
  /** Icono decorativo a la izquierda del control. */
  icon?: LucideIcon
  /** Tipografia mayor para importes, que son el dato que el usuario revisa. */
  emphasis?: boolean
}

export function TextField({
  id,
  label,
  hint,
  error,
  prefix,
  icon: Icon,
  emphasis = false,
  ...props
}: TextFieldProps) {
  const hasAdornment = Boolean(prefix || Icon)

  return (
    <FieldLayout id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500 ${
              emphasis ? 'text-lg font-semibold' : 'text-sm'
            }`}
          >
            {prefix}
          </span>
        )}
        {Icon && !prefix && (
          <Icon
            className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, hint, error)}
          className={`${CONTROL_CLASSES} ${hasAdornment ? 'pl-9' : ''} ${
            emphasis ? 'text-lg font-semibold tabular-nums' : 'text-sm'
          }`}
          {...props}
        />
      </div>
    </FieldLayout>
  )
}
