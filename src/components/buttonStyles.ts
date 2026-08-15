export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'md' | 'lg'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // `brand-700` es el tono mas claro de la marca que mantiene 4.5:1 con texto blanco.
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-slate-500',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

/**
 * Estilo de boton, en un modulo aparte para poder aplicarlo tambien al enlace del hero.
 *
 * Ese enlace es un `<a>` con destino: hacer `Button` polimorfico solo para compartir el aspecto
 * seria mas complejo que compartir la cadena de clases.
 */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`
}
