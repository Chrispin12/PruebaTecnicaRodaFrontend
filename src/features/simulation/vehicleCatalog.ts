import type { VehicleType } from '../../types/api'
import { VEHICLE_TYPE_LABELS } from '../../schemas/simulationForm'

export interface CatalogVehicle {
  id: string
  name: string
  summary: string
  vehicle_type: VehicleType
  vehicle_value: string
  down_payment: string
  term_months: string
}

/**
 * Catalogo de demostracion. No viene del backend ni pretende ser inventario de Roda:
 * son seis combinaciones validas (precio, cuota inicial y plazo) para rellenar el
 * formulario sin teclear. El calculo sigue haciendolo la API.
 */
export const VEHICLE_CATALOG: readonly CatalogVehicle[] = [
  {
    id: 'bike-city',
    name: 'Andina Urbana',
    summary: 'Ciudad y trayectos cortos',
    vehicle_type: 'electric_bicycle',
    vehicle_value: '2800000',
    down_payment: '400000',
    term_months: '12',
  },
  {
    id: 'bike-cargo',
    name: 'Andina Carga',
    summary: 'Domicilios y carga ligera',
    vehicle_type: 'electric_bicycle',
    vehicle_value: '4200000',
    down_payment: '600000',
    term_months: '18',
  },
  {
    id: 'bike-range',
    name: 'Andina Ruta',
    summary: 'Mayor autonomía',
    vehicle_type: 'electric_bicycle',
    vehicle_value: '5600000',
    down_payment: '800000',
    term_months: '24',
  },
  {
    id: 'moto-compact',
    name: 'Rayo Compacta',
    summary: 'Uso diario en ciudad',
    vehicle_type: 'electric_motorcycle',
    vehicle_value: '6200000',
    down_payment: '1200000',
    term_months: '18',
  },
  {
    id: 'moto-work',
    name: 'Rayo Trabajo',
    summary: 'Jornadas largas',
    vehicle_type: 'electric_motorcycle',
    vehicle_value: '8000000',
    down_payment: '2000000',
    term_months: '24',
  },
  {
    id: 'moto-plus',
    name: 'Rayo Plus',
    summary: 'Más potencia y autonomía',
    vehicle_type: 'electric_motorcycle',
    vehicle_value: '12500000',
    down_payment: '2500000',
    term_months: '36',
  },
]

export const CATALOG_BY_TYPE: Record<VehicleType, readonly CatalogVehicle[]> = {
  electric_bicycle: VEHICLE_CATALOG.filter((item) => item.vehicle_type === 'electric_bicycle'),
  electric_motorcycle: VEHICLE_CATALOG.filter(
    (item) => item.vehicle_type === 'electric_motorcycle',
  ),
}

export const CATALOG_SECTIONS: { type: VehicleType; title: string }[] = (
  Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]
).map((type) => ({ type, title: VEHICLE_TYPE_LABELS[type] }))
