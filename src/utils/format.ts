/**
 * Formato de presentacion. Unico lugar donde se decide como se ve un importe o una tasa.
 *
 * Estas funciones NO calculan: reciben el valor que ya calculo el backend y solo lo
 * convierten en texto legible en convencion colombiana.
 */

const wholeAmountFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

const centsAmountFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const rateFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 })

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeStyle: 'short',
})

/**
 * Formatea un importe en pesos: `$3.500.000`, o `$310.395,84` si tiene centavos.
 *
 * Se muestran los centavos solo cuando existen, igual que hace el backend en sus mensajes:
 * un umbral redondo no deberia leerse `$500.000,00`.
 */
export function formatCop(amount: string): string {
  const value = Number(amount)

  if (Number.isNaN(value)) {
    return amount
  }

  const formatter = Number.isInteger(value) ? wholeAmountFormatter : centsAmountFormatter
  return `$${formatter.format(value)}`
}

/** Agrupa los miles de una cadena de digitos para mostrarla dentro de un input. */
export function groupDigits(digits: string): string {
  if (digits === '') {
    return ''
  }

  return wholeAmountFormatter.format(Number(digits))
}

/** Convierte una fraccion decimal en porcentaje: `0.018088` -> `1,8088 %`. */
export function formatRate(rate: string): string {
  const value = Number(rate)

  if (Number.isNaN(value)) {
    return rate
  }

  return `${rateFormatter.format(value * 100)} %`
}

/** Formatea una fecha ISO del backend para mostrarla al usuario. */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  return dateFormatter.format(date)
}
