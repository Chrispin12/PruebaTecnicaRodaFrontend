import { describe, expect, it } from 'vitest'

import { formatCop, formatDateTime, formatRate, groupDigits } from './format'

describe('formatCop', () => {
  it('usa la convencion colombiana de miles', () => {
    expect(formatCop('8000000')).toBe('$8.000.000')
    expect(formatCop('500000')).toBe('$500.000')
  })

  it('omite los centavos cuando el importe es exacto', () => {
    expect(formatCop('6000000.00')).toBe('$6.000.000')
    expect(formatCop('0.00')).toBe('$0')
  })

  it('muestra los centavos con coma decimal cuando existen', () => {
    expect(formatCop('1064252.04')).toBe('$1.064.252,04')
  })

  it('devuelve el valor original si no es numerico, en lugar de mostrar NaN', () => {
    expect(formatCop('sin dato')).toBe('sin dato')
  })
})

describe('groupDigits', () => {
  it('agrupa los miles del texto que se escribe en el input', () => {
    expect(groupDigits('3500000')).toBe('3.500.000')
    expect(groupDigits('0')).toBe('0')
  })

  it('deja vacio el campo vacio', () => {
    expect(groupDigits('')).toBe('')
  })
})

describe('formatRate', () => {
  it('convierte la fraccion del backend en porcentaje', () => {
    expect(formatRate('0.24')).toBe('24 %')
    expect(formatRate('0.018088')).toBe('1,8088 %')
  })
})

describe('formatDateTime', () => {
  it('devuelve la cadena original si la fecha no es valida', () => {
    expect(formatDateTime('fecha rara')).toBe('fecha rara')
  })

  it('formatea una fecha ISO del backend', () => {
    expect(formatDateTime('2026-08-14T17:05:12.482913Z')).toContain('2026')
  })
})
