import type { LucideIcon } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export interface RadioOption {
  value: string
  label: string
  icon?: LucideIcon
}

interface RadioGroupFieldProps {
  legend: string
  options: readonly RadioOption[]
  /** Resultado de `register(...)`: el grupo comparte nombre, `onChange`, `onBlur` y `ref`. */
  registration: UseFormRegisterReturn
  /** `card` para pocas opciones con icono; `chip` para una lista corta de valores. */
  variant?: 'card' | 'chip'
  hint?: string
  error?: string
}

const CONTAINER_CLASSES = {
  card: 'mt-2 grid grid-cols-2 gap-2.5',
  chip: 'mt-2 flex flex-wrap gap-2',
} as const

// El hover se cuelga del `group` de la etiqueta y no del `peer` del input: el radio es
// `sr-only`, asi que el puntero nunca esta sobre el y `peer-hover` no se activaria. El foco si
// usa `peer-focus-visible`, porque el teclado si llega al input real.
const OPTION_BASE_CLASSES =
  'block cursor-pointer border border-slate-300 bg-white font-medium text-slate-700 transition group-hover:border-slate-400 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-700'

const OPTION_VARIANT_CLASSES = {
  card: 'rounded-xl px-3 py-4 text-center text-sm peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800',
  chip: 'rounded-lg px-3.5 py-2 text-sm tabular-nums peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white',
} as const

/**
 * Grupo de opciones excluyentes presentado como tarjetas o etiquetas seleccionables.
 *
 * Se prefiere a un `<select>` cuando hay pocas opciones: se ven todas de golpe y se eligen con
 * un solo toque, que en un simulador es la diferencia entre comparar y no comparar. Debajo hay
 * radios nativos (`sr-only`), asi que el teclado y los lectores de pantalla funcionan igual;
 * el aspecto lo aporta el hermano `peer-checked`.
 */
export function RadioGroupField({
  legend,
  options,
  registration,
  variant = 'card',
  hint,
  error,
}: RadioGroupFieldProps) {
  const describedBy = error
    ? `${registration.name}-error`
    : hint
      ? `${registration.name}-hint`
      : undefined

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>

      <div className={CONTAINER_CLASSES[variant]}>
        {options.map((option) => {
          const Icon = option.icon

          return (
            <label key={option.value} className="group">
              <input
                type="radio"
                className="peer sr-only"
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                {...registration}
                value={option.value}
              />
              <span className={`${OPTION_BASE_CLASSES} ${OPTION_VARIANT_CLASSES[variant]}`}>
                {Icon && <Icon className="mx-auto mb-1.5 size-6" aria-hidden="true" />}
                {option.label}
              </span>
            </label>
          )
        })}
      </div>

      {error ? (
        <p
          id={`${registration.name}-error`}
          role="alert"
          className="mt-1.5 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${registration.name}-hint`} className="mt-1.5 text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </fieldset>
  )
}
