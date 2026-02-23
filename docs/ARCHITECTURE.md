# ProyectoHouse - Arquitectura y Flujos Clave

## Descripción General
ProyectoHouse es una aplicación web MVP para la gestión de inmuebles y alquileres, diseñada como el motor inicial para un SaaS multi-tenant. Está orientada al mercado uruguayo, considerando sus lógicas específicas (Moneda en UYU, garantías ANDA/CGN/Porto, entre otras). 

## Stack Tecnológico
- **Frontend**: Next.js 15 (App Router) + React + TailwindCSS (múltiples variables y glassmorphism)
- **Backend**: Next.js Server Actions & Route Handlers
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Extracción de Textos**: `pdf-parse` con algoritmos heurísticos deterministas basados en regex (expresiones regulares).

## Modelo de Datos (Esquema Principal)
Toda la base de datos está planeada bajo el paradigma **Multi-tenant**. Todas las entidades están atadas estructuralmente a una `Organization (orgId)`.

### Entidades Core
- **Organization & User**: Soporte multi-tenant con RBAC simplificado (actualmente MVP expone rol ADMIN).
- **Property & Unit**: Edificios o complejos (Property) y sus subdivisiones habitables (Units).
- **Tenant**: El locatario o arrendatario.
- **Lease**: Entidad central que une Unit, Tenant, y maneja plazos, fechas de vencimiento y montos.
- **Guarantee**: Tipos de garantía del Uruguay (ANDA, Aseguradoras, Depósito, Fiador Solidario). Poseen trackeo de vencimiento propio.
- **Charge & Payment & Allocation**:
  - `Charge` representa la deuda que se genera (ej: Alquiler mensual).
  - `Payment` representa el ingreso manual o pago.
  - `Allocation` es el puente que asocia X pesos del pago a X deuda, permitiendo calcular morosidad (si sum(Charge) > sum(Allocation)).

## Flujos Principales

### 1. Ingestión y Extracción de Contrato (PDF)
1. El usuario administrador sube un archivo `PDF` a través del Dashboard.
2. El archivo se envía al router `/api/extract` mediante formData.
3. El router lee el Buffer en memoria y extrae el texto usando `pdf-parse`.
4. Mediante expresiones regulares adaptadas a redacciones uruguayas, se determinan y **proponen** campos: Monto, Fechas, CI del Inquilino y Garantía.
5. El sistema devuelve al cliente estos datos con estado `PROPOSED`.
6. La UI muestra los resultados intermedios. El administrador revisa y **confirma**. Las decisiones se guardan bajo el status de `CONFIRMED`.

### 2. Generación de Cargos Mensuales
En base a los `Lease` con estado `ACTIVE`, todos los meses (idealmente mediante un Cron local o invocador de APIs servidor tipo Vercel Cron):
- Se itera sobre contratos.
- Se genera un `Charge` del tipo `RENT` usando `dueDayOfMonth` y el monto pautado. Esto suma a la morosidad hasta que reciba un `Payment`.

### 3. Rentabilidad (Próximamente / Implementación Parcial)
Mediante las transacciones contables integradas en la BBDD, se agrupan:
`SUM(Allocations to Charges) - SUM(Expenses of specific Property)` agrupadas temporalmente (Mes actual, 3 meses, YTD).

## Extensibilidad Futura 
- Soporte Multi-moneda en cargos.
- Integración con pasarelas (MercadoPago Uruguay).
- Roles iterativo: Portal para Dueños e Inquilinos (Solo lectura/Descarga de facturas).
