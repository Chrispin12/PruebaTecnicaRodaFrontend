import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import { groupDigits } from '../utils/format'
import { TextField } from './Field'

interface MoneyFieldProps<TValues extends FieldValues> {
  control: Control<TValues>
  name: Path<TValues>
  label: string
  hint?: string
  disabled?: boolean
  onValueBlur?: (value: string) => void
}

/**
 * Campo de importe en pesos.
 *
 * El valor del formulario son digitos sin formato (`"3500000"`), que es lo que espera la API;
 * lo que se muestra va agrupado (`3.500.000`) para que la cifra sea legible mientras se
 * escribe. Se descarta cualquier caracter que no sea un digito, asi que el campo no admite
 * centavos: los precios de vehiculo se cotizan en pesos enteros.
 *
 * Es controlado (`Controller`) porque el texto visible y el valor almacenado no coinciden.
 */
export function MoneyField<TValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  disabled = false,
  onValueBlur,
}: MoneyFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          id={name}
          label={label}
          hint={hint}
          error={fieldState.error?.message}
          prefix="$"
          emphasis
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          disabled={disabled}
          name={field.name}
          ref={field.ref}
          value={groupDigits(String(field.value ?? ''))}
          onBlur={() => {
            onValueBlur?.(String(field.value ?? ''))
            field.onBlur()
          }}
          onChange={(event) => field.onChange(toDigits(event.target.value))}
        />
      )}
    />
  )
}

/** Deja solo digitos y quita los ceros a la izquierda para no enviar `"0500000"`. */
function toDigits(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
}
