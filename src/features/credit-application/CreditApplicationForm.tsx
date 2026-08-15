import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { ErrorMessage } from '../../components/ErrorMessage'
import { TextField } from '../../components/Field'
import {
  CREDIT_APPLICATION_FORM_DEFAULTS,
  CREDIT_APPLICATION_FORM_FIELDS,
  creditApplicationFormSchema,
  toCreditApplicationRequest,
  type CreditApplicationFormValues,
} from '../../schemas/creditApplicationForm'
import type { CreditApplicationResponse, SimulationResponse } from '../../types/api'
import { applyApiError } from '../../utils/apiFormErrors'
import { formatCop } from '../../utils/format'
import { useCreditApplicationMutation } from './useCreditApplicationMutation'

interface CreditApplicationFormProps {
  /** Simulacion aceptada por el usuario: aporta las condiciones que se registran. */
  simulation: SimulationResponse
  onRegistered: (application: CreditApplicationResponse) => void
  onCancel: () => void
}

export function CreditApplicationForm({
  simulation,
  onRegistered,
  onCancel,
}: CreditApplicationFormProps) {
  const [generalError, setGeneralError] = useState<string | null>(null)
  const { mutate, isPending } = useCreditApplicationMutation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreditApplicationFormValues>({
    resolver: zodResolver(creditApplicationFormSchema),
    defaultValues: CREDIT_APPLICATION_FORM_DEFAULTS,
  })

  const submit = handleSubmit((values) => {
    if (isPending) {
      return
    }

    setGeneralError(null)
    mutate(toCreditApplicationRequest(values, simulation), {
      onSuccess: (application) => onRegistered(application),
      onError: (error) =>
        setGeneralError(applyApiError(error, setError, CREDIT_APPLICATION_FORM_FIELDS)),
    })
  })

  return (
    <Card
      title="Solicita tu crédito"
      description={`Registramos tu solicitud con una cuota de ${formatCop(simulation.monthly_payment)} a ${simulation.term_months} meses.`}
    >
      <form onSubmit={submit} noValidate className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Información personal
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="first_name"
              label="Nombre"
              icon={User}
              autoComplete="given-name"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <TextField
              id="last_name"
              label="Apellido"
              icon={User}
              autoComplete="family-name"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Contacto
          </legend>
          <TextField
            id="email"
            label="Correo electrónico"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="phone"
              label="Teléfono"
              type="tel"
              icon={Phone}
              inputMode="tel"
              autoComplete="tel"
              placeholder="3001234567"
              hint="Solo dígitos, sin espacios."
              error={errors.phone?.message}
              {...register('phone')}
            />
            <TextField
              id="city"
              label="Ciudad"
              icon={MapPin}
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>
        </fieldset>

        {generalError && <ErrorMessage>{generalError}</ErrorMessage>}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button type="submit" size="lg" isLoading={isPending} className="sm:flex-1">
            {isPending ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          Usamos tus datos únicamente para contactarte sobre esta solicitud.
        </p>
      </form>
    </Card>
  )
}
