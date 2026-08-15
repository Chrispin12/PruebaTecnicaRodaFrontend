# Roda — Simulador de crédito (frontend)

Interfaz web para simular la financiación de una bicicleta o moto eléctrica y registrar la
solicitud de crédito.

Prueba técnica — vacante Full Stack Developer (Roda).

**Aplicación en producción:** [https://prueba-tecnica-roda-frontend.vercel.app](https://prueba-tecnica-roda-frontend.vercel.app)

La API vive en un repositorio aparte:
[PruebaTecnicaRodaBackend](https://github.com/Chrispin12/PruebaTecnicaRodaBackend)
([Cloud Run](https://roda-credit-api-446921260054.us-central1.run.app)).

**Este cliente no calcula nada financiero.** Cuota, intereses, valor financiado, totales, tasas
y tabla de amortización los calcula el backend. Aquí se capturan datos, se valida la
estructura, se llama a la API y se muestra la respuesta.

---

## Qué puede hacer el usuario

1. Elegir un **modelo de ejemplo** (3 bicicletas y 3 motos, con precio, inicial mínima y plazo)
   o escribir valores propios.
2. Ajustar **plazo** y **cuota inicial** (si hay modelo elegido, la inicial no puede bajar del
   mínimo; puede marcar *Deseo proceder sin cuota inicial* para simular con $0).
3. Ver el **resumen** (cuota mensual como dato principal) y la **tabla de amortización**.
4. **Solicitar crédito** solo después de una simulación exitosa (nombre, apellido, tipo y
   número de documento, correo, teléfono, ciudad). La API identifica al cliente por la cédula:
   varios créditos, el correo puede cambiar; no hay login.
5. Ver la **confirmación** con id, documento, fecha y cuota registrada.

---

## Stack

| Herramienta | Para qué |
| --- | --- |
| React 19 + TypeScript | UI y contrato de la API |
| Vite 8 | Desarrollo y build |
| Tailwind CSS 4 | Estilos (`@theme` en CSS, sin `tailwind.config.js`) |
| TanStack Query | `useMutation` (simular y registrar) |
| React Hook Form + Zod | Formularios y validación estructural |
| `fetch` | HTTP. Dos POST JSON: no hace falta Axios |
| lucide-react | Iconos (bici, moto, etc.) |
| Vitest + Testing Library + MSW | Tests con la red interceptada |
| oxlint + Prettier | Lint y formato |

---

## Cómo ejecutar

Requisitos: Node 20+ y la API en marcha (`http://localhost:8000` con Docker Compose en el
repo del backend).

```bash
copy .env.example .env
npm install
npm run dev
```

Abre http://localhost:5173.

El backend debe permitir CORS desde `http://localhost:5173` (`CORS_ALLOW_ORIGINS`).

### Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | Sí en producción | URL base de la API, **sin barra final**. Local: `http://localhost:8000` |

En desarrollo, si falta, se usa `http://localhost:8000`. En un build de producción su ausencia
lanza un error al arrancar: mejor fallar a vista que apuntar en silencio a localhost.

No hay secretos en el frontend. Todo lo que entra al bundle es público.

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite con recarga |
| `npm run build` | `tsc -b` + bundle en `dist/` |
| `npm run preview` | Sirve el bundle |
| `npm test` | Vitest una vez |
| `npm run lint` | oxlint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | Solo tipos |

---

## Arquitectura

```
src/
├── app/            Cabecera, hero, página que orquesta el flujo
├── components/     UI reutilizable (botón, card, campos). Sin dominio
├── features/
│   ├── simulation/          Formulario, catálogo, resumen, amortización
│   └── credit-application/  Solicitud y confirmación
├── schemas/        Zod + adaptación al contrato de la API
├── services/api/   Único lugar que hace HTTP
├── types/          Contrato del backend (importes como `string`)
├── utils/          Formato COP y mapeo de errores de API
└── test/           Fixtures MSW y helpers
```

```
Formulario (RHF + Zod) → useMutation → services/api → backend
                                              ↓
                   estado local de la página ← respuesta tipada
```

- Ningún componente hace `fetch` directo.
- El flujo (`simulation`, `application`) vive en `useState` de la página. No hay Redux ni
  Zustand: son dos datos de una sola pantalla.
- Zod valida estructura (obligatorio, dígitos, email, teléfono). Los límites de negocio
  (mínimo $500.000, etc.) los aplica el backend.
- El catálogo de modelos es **solo frontend** (atajos de UX). No es inventario de Roda.

---

## Endpoints que consume

| Método | Ruta | Cuándo |
| --- | --- | --- |
| `POST` | `/api/v1/simulations` | Calcular plan |
| `POST` | `/api/v1/credit-applications` | Registrar solicitud |

Nunca envía `monthly_payment`, `financed_amount`, tasas ni totales. El backend los rechazaría
(`extra="forbid"`) y los recalcula al persistir.

---

## Decisiones técnicas

**Importes como texto.** El backend manda `"310395.84"`. Pasarlo a `number` introduce float
sin ganancia: aquí no se opera, solo se formatea (`$310.395,84`) en `utils/format.ts`.

**Catálogo.** Seis modelos de demostración. Al elegir uno se rellenan tipo, precio, inicial
mínima y plazo. El usuario puede **subir** la inicial y **cambiar** el plazo. Si escribe por
debajo del mínimo, aparece alerta (`La cuota inicial mínima de este vehículo es $400.000.`).
La casilla *Deseo proceder sin cuota inicial* envía `down_payment: "0"` sin teclear cero.

**Radios en vez de `<select>`** para tipo y plazo: pocas opciones, se ven todas.

**TanStack Query solo en mutaciones.** No hay listados que cachear. `retry: false` en POST de
solicitud para no duplicar registros.

**Errores**

| HTTP | UI |
| --- | --- |
| 400 | Mensaje del backend |
| 422 | Por campo si coincide; si no, aviso general |
| 5xx / red | «No fue posible procesar la solicitud. Intenta nuevamente.» |

Nunca se pinta HTML de la API (`dangerouslySetInnerHTML` no se usa).

**Visual.** Paleta `brand-*` propia (no copiada de Roda). Cuota mensual a tamaño dominante.
Animaciones solo de entrada y con `motion-safe:`.

**Accesibilidad.** Labels, `aria-invalid`, `role="alert"` / `status`, foco visible, tabla con
scroll horizontal en móvil.

---

## Tests

`npm test` (Vitest + MSW). Las peticiones se interceptan en red, no mockeando el módulo HTTP.

Cubre render del formulario, catálogo, mínimo de inicial, casilla sin cuota inicial, envío
correcto, loading, doble submit, flujo de página (vacío → resultado → solicitud →
confirmación) y errores 400/422/500.

---

## Despliegue en Vercel (producción)

**URL pública:** [https://prueba-tecnica-roda-frontend.vercel.app](https://prueba-tecnica-roda-frontend.vercel.app)

El frontend es un build estático de Vite. Vercel lo sirve por CDN. `VITE_API_URL` se **incrusta
en el build**: si falta, la aplicación lanza un error al arrancar (pantalla en blanco). Hay
que definirla **antes** de construir y **volver a desplegar** si cambia la URL de la API.

### Cómo está configurado este proyecto

| Ajuste | Valor |
| --- | --- |
| Repositorio | [Chrispin12/PruebaTecnicaRodaFrontend](https://github.com/Chrispin12/PruebaTecnicaRodaFrontend) |
| Root Directory | *(vacío: este repo es el frontend)* |
| Framework | Vite (`vercel.json`) |
| Variable `VITE_API_URL` | `https://roda-credit-api-446921260054.us-central1.run.app` |

### Cómo repetir el despliegue

1. Importar el repositorio en [Vercel](https://vercel.com).
2. **Settings → Environment Variables** → Production:
   - Nombre: `VITE_API_URL`
   - Valor: URL de Cloud Run **sin barra final**.
3. Deploy (o Redeploy **sin** caché de build si la variable se añadió después).
4. El origen `https://prueba-tecnica-roda-frontend.vercel.app` debe estar en
   `CORS_ALLOW_ORIGINS` del backend (ya configurado en Cloud Run).

Orden correcto: Cloud SQL → migraciones Alembic → Cloud Run → `VITE_API_URL` → Vercel → CORS.

### Comprobar

1. La UI carga (hero + simulador).
2. Calcular cuota llama a `POST …/api/v1/simulations`.
3. Solicitar crédito llama a `POST …/api/v1/credit-applications` y muestra un UUID.

---

## Fuera de alcance

Login, JWT, verificación KYC. El cálculo financiero no se replica aquí.

---

## Licencia / contexto

Código de prueba técnica. Los modelos de ejemplo y la tasa de la API no representan el
catálogo ni las condiciones comerciales reales de Roda.
