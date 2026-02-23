# Guía de Despliegue en Producción (Vercel + Supabase)

El MVP de ProyectoHouse está diseñado para correr completamente en un entorno *Serverless* moderno.

## 1. Crear la Base de Datos en Supabase
1. Ingresa a [Supabase](https://supabase.com) y crea un nuevo proyecto (Organization/Project).
2. Guarda el **Database Password** que ingreses. Te servirá para obtener el *Connection String*.
3. Ve a `Project Settings -> Database` y copia la URL de conexión bajo la pestaña "URI" (ejemplo: `postgresql://postgres.[tu-id]:[tu-password]...`).
4. Ve a `Project Settings -> API` y copia la `URL` y la clave pública `anon`.

## 2. Preparar tu Repositorio en GitHub
Si aún no lo hiciste, sube esta carpeta a tu repositorio de GitHub:
```bash
git init
git add .
git commit -m "MVP Inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ProyectoHouse.git
git push -u origin main
```

> **IMPORTANTE**: No modifiques más el valor `provider = "sqlite"` localmente que dejamos antes de subir. Para producción, cambiaremos ésto a `"postgresql"` en Vercel antes del despliegue en un script post-install.
> 
> *Alternativamente, cambia en `prisma/schema.prisma` el provider a `"postgresql"` y commitea, si dejas de usar SQLite local.*

## 3. Despliegue en Vercel
1. Ingresa a [Vercel](https://vercel.com) e importa tu repositorio de GitHub recién creado.
2. Antes de clickear **Deploy**, abre la pestaña `Environment Variables` y agrega todas las mismas variables que están en tu `.env` (pero con valores reales):

```env
DATABASE_URL="TU_CONEXION_POSTGRES_DE_SUPABASE"
NEXT_PUBLIC_SUPABASE_URL="TU_URL_DE_SUPABASE"
NEXT_PUBLIC_SUPABASE_ANON_KEY="TU_CLAVE_ANON_DE_SUPABASE"
CRON_SECRET="GENERA_UNA_CONTRASEÑA_UNICA"
NEXT_PUBLIC_APP_URL="URL_DE_VERCEL_O_TU_DOMINIO"
```

3. Modifica tu *Build Command* de Vercel (en las configuraciones de build) para ejecutar prisma generate antes del build de next:
`npx prisma generate && next build`

4. Haz click en **Deploy**.

## 4. Migración e Inicialización de BD Remota
Dado que Vercel alojó tu proyecto, la base de datos de Supabase sigue vacía. Desde tu PC local, corre:
```bash
# Cambia temporalmente tu .env a los datos remotos (Postgres)
# Y cambia en schema.prisma el "sqlite" por "postgresql"
npx prisma db push
```

## 5. Trabajos Programados (Cron)
Para facturaciones automáticas de rentas, incluimos un `vercel.json` que dispara solicitudes temporizadas cada cierto tiempo en el mes.
Para asegurar su seguridad, en Vercel agrega la variable `CRON_SECRET` y nuestra ruta `/api/cron/charges` se ejecutará correctamente protegiendo la idempotencia mes a mes.
