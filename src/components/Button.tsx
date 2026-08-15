import { LoaderCircle } from 'lucide-react'
import type { ComponentPropsWithRef } from 'react'

import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  // Por defecto no envia el formulario: quien quiera enviarlo lo declara explicitamente.
  type = 'button',
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${buttonClasses(variant, size)} ${className}`}
      {...props}
    >
      {isLoading && <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
