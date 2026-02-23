# ProyectoHouse - Setup & Desarrollo Local

Este documento detalla los pasos para levantar el MVP completo (Frontend Next.js, Backend Prisma + PostgreSQL) en entorno local.

## 0. Requisitos Previos
- Node.js (v18 o superior)
- Docker y Docker Compose instalados localmente
- Credenciales gratuitas de [Supabase](https://supabase.com) (Para Auth MVP).

## 1. Instalación
Dentro de la carpeta `ProyectoHouse`, instala dependencias:
```bash
npm install
```

## 2. Variables de Entorno (`.env`)
Debes llenar correctamente el archivo `.env` que se genera o puedes crear uno manualmente, con:
```env
# Prisma/Postgres Local Database
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/proyectohouse?schema=public"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL_HERE"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Opciones Generales
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 3. Base de Datos Local
Ejecuta el docker-compose provisto:
```bash
docker compose up -d
```
Esto levanta un contenedor PostgreSQL en el puerto `5432`.

## 4. Prisma, Migraciones y Seed
Configura el esquema inicial:
```bash
npx prisma db push
# O en su defecto
npx prisma migrate dev --name init
```
*(Opcional - Próximamente)* Corre el seed de desarrollo para tener Data Pre-Poblada:
```bash
npx prisma db seed
```

## 5. Levantar Entorno de Desarrollo
Inicia Next.js:
```bash
npm run dev
```

Navega a [http://localhost:3000](http://localhost:3000). Visualizarás el Login por defecto. 

## 6. Pruebas Unitarias (Lógica Contable y Rendimiento MVP)
Existen pruebas con Jest para avalar la idempotencia y robustez financiera dictada.
```bash
npm run test
```
*(Nota MVP: El test runner puede ser instalado luego y es el principal de Next.js).*
