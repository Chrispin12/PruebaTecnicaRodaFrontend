import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { ApiError, GENERIC_ERROR_MESSAGE } from '../services/api/client'

/**
 * Traduce un error de la API a errores de formulario.
 *
 * - 422 (validacion): cada detalle se asocia a su campo cuando el formulario lo conoce.
 * - 400 (regla de negocio): el mensaje del backend se muestra completo; no apunta a un campo.
 * - Resto: mensaje generico, sin exponer detalles internos.
 *
 * Devuelve el mensaje que debe mostrarse como aviso general, o `null` si todo el error quedo
 * repartido entre los campos.
 */
export function applyApiError<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
  formFields: readonly Path<TValues>[],
): string | null {
  if (!(error instanceof ApiError)) {
    return GENERIC_ERROR_MESSAGE
  }

  if (!error.isValidation || error.details.length === 0) {
    return error.message
  }

  const knownFields = new Set<string>(formFields)
  let hasUnmappedDetail = false

  for (const detail of error.details) {
    if (knownFields.has(detail.field)) {
      setError(detail.field as Path<TValues>, { type: 'server', message: detail.message })
    } else {
      hasUnmappedDetail = true
    }
  }

  return hasUnmappedDetail ? error.message : null
}
