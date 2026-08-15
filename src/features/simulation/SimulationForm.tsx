import { zodResolver } from '@hookform/resolvers/zod'
import { Bike, Motorbike, ShieldCheck, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { ErrorMessage } from '../../components/ErrorMessage'
import { MoneyField } from '../../components/MoneyField'
import { RadioGroupField, type RadioOption } from '../../components/RadioGroupField'
import {
  SIMULATION_FORM_DEFAULTS,
  SIMULATION_FORM_FIELDS,
  TERM_MONTHS_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  simulationFormSchema,
  toSimulationRequest,
  type SimulationFormValues,
} from '../../schemas/simulationForm'
import type { SimulationResponse, VehicleType } from '../../types/api'
import { applyApiError } from '../../utils/apiFormErrors'
import { formatCop } from '../../utils/format'
import { VehicleCatalogPicker } from './VehicleCatalogPicker'
import { VEHICLE_CATALOG, type CatalogVehicle } from './vehicleCatalog'
import { useSimulationMutation } from './useSimulationMutation'

// El icono es presentacion, asi que se asigna aqui y no en el esquema del formulario, que solo
// describe el contrato de los datos.
const VEHICLE_TYPE_ICONS: Record<VehicleType, LucideIcon> = {
  electric_bicycle: Bike,
  electric_motorcycle: Motorbike,
}

const VEHICLE_OPTIONS: RadioOption[] = VEHICLE_TYPE_OPTIONS.map((option) => ({
  ...option,
  icon: VEHICLE_TYPE_ICONS[option.value],
}))

interface SimulationFormProps {
  onSimulated: (simulation: SimulationResponse) => void
}

export function SimulationForm({ onSimulated }: SimulationFormProps) {
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [skipDownPayment, setSkipDownPayment] = useState(false)
  const { mutate, isPending } = useSimulationMutation()

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: SIMULATION_FORM_DEFAULTS,
  })

  const currentValues = watch()
  const selectedCatalog =
    VEHICLE_CATALOG.find((vehicle) => vehicle.id === selectedCatalogId) ?? null

  useEffect(() => {
    if (!selectedCatalog) {
      return
    }
    if (
      currentValues.vehicle_type !== selectedCatalog.vehicle_type ||
      currentValues.vehicle_value !== selectedCatalog.vehicle_value
    ) {
      setSelectedCatalogId(null)
    }
  }, [selectedCatalog, currentValues.vehicle_type, currentValues.vehicle_value])

  function applyCatalogVehicle(vehicle: CatalogVehicle) {
    setSelectedCatalogId(vehicle.id)
    setSkipDownPayment(false)
    setValue('vehicle_type', vehicle.vehicle_type, { shouldDirty: true, shouldValidate: true })
    setValue('vehicle_value', vehicle.vehicle_value, { shouldDirty: true, shouldValidate: true })
    setValue('down_payment', vehicle.down_payment, { shouldDirty: true, shouldValidate: true })
    setValue('term_months', vehicle.term_months, { shouldDirty: true, shouldValidate: true })
    clearErrors('down_payment')
  }

  function toggleSkipDownPayment(checked: boolean) {
    setSkipDownPayment(checked)
    if (checked) {
      setValue('down_payment', '0', { shouldDirty: true, shouldValidate: true })
      clearErrors('down_payment')
      return
    }
    if (selectedCatalog) {
      setValue('down_payment', selectedCatalog.down_payment, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  function catalogDownPaymentError(downPayment: string): string | null {
    if (!selectedCatalog || skipDownPayment) {
      return null
    }
    if (downPayment === '' || Number(downPayment) >= Number(selectedCatalog.down_payment)) {
      return null
    }
    return `La cuota inicial mínima de este vehículo es ${formatCop(selectedCatalog.down_payment)}.`
  }

  const submit = handleSubmit((values) => {
    if (isPending) {
      return
    }

    const catalogError = catalogDownPaymentError(values.down_payment)
    if (catalogError) {
      setError('down_payment', { type: 'min', message: catalogError })
      return
    }

    setGeneralError(null)
    mutate(toSimulationRequest(values), {
      // Se envuelve el callback: `onSuccess` tambien recibe las variables y el contexto de la
      // mutacion, que no le interesan a la pagina.
      onSuccess: (simulation) => onSimulated(simulation),
      onError: (error) => setGeneralError(applyApiError(error, setError, SIMULATION_FORM_FIELDS)),
    })
  })

  return (
    <Card
      title="Simula tu crédito"
      description="Cuéntanos qué quieres financiar y te mostramos tu plan de pagos."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <VehicleCatalogPicker selectedId={selectedCatalogId} onSelect={applyCatalogVehicle} />

        <RadioGroupField
          legend="Tipo de vehículo"
          options={VEHICLE_OPTIONS}
          registration={register('vehicle_type')}
          error={errors.vehicle_type?.message}
        />

        <MoneyField
          control={control}
          name="vehicle_value"
          label="Valor del vehículo"
          hint="Precio total en pesos colombianos."
        />

        <div>
          <MoneyField
            control={control}
            name="down_payment"
            label="Cuota inicial"
            disabled={skipDownPayment}
            onValueBlur={(value) => {
              const message = catalogDownPaymentError(value)
              if (message) {
                setError('down_payment', { type: 'min', message })
                return
              }
              clearErrors('down_payment')
            }}
            hint={
              skipDownPayment
                ? 'Simularás sin cuota inicial.'
                : selectedCatalog
                  ? `Mínimo ${formatCop(selectedCatalog.down_payment)} para este modelo. Puedes dar más.`
                  : 'Cuánto puedes pagar hoy, o marca la casilla si no darás inicial.'
            }
          />
          <label className="mt-2 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
            <input
              id="skip-down-payment"
              type="checkbox"
              className="mt-0.5 size-4 rounded border-slate-300 text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
              checked={skipDownPayment}
              onChange={(event) => toggleSkipDownPayment(event.target.checked)}
            />
            Deseo proceder sin cuota inicial
          </label>
        </div>

        <RadioGroupField
          legend="Plazo"
          variant="chip"
          options={TERM_MONTHS_OPTIONS}
          registration={register('term_months')}
          error={errors.term_months?.message}
        />

        {generalError && <ErrorMessage>{generalError}</ErrorMessage>}

        <Button type="submit" size="lg" isLoading={isPending} className="w-full">
          {isPending ? 'Calculando...' : 'Calcular mi cuota'}
        </Button>

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          Simular es gratis y no guardamos ningún dato hasta que envíes la solicitud.
        </p>
      </form>
    </Card>
  )
}
