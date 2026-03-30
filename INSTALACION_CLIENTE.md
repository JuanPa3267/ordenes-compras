# Guía de Instalación para el Cliente (Windows)

Esta guía detalla el paso a paso necesario para tomar el proyecto actual y ponerlo a funcionar en la computadora de un cliente. El proyecto se basa en **Next.js**, usa **Prisma ORM** y requiere una base de datos **PostgreSQL**.

> [!IMPORTANT]
> Se asume que la instalación será local, es decir, todo correrá físicamente en la PC del cliente (servidor y base de datos).

---

## 1. Instalación de Requisitos Previos

En la computadora del cliente, debes descargar e instalar lo siguiente:

1. **Node.js**: Descargar la versión **LTS** (Long Term Support) desde [nodejs.org](https://nodejs.org/). Esto instalará también `npm`.
2. **PostgreSQL**: Descargar el instalador para Windows desde [postgresql.org](https://www.postgresql.org/download/windows/). 
   - Durante la instalación, **anota muy bien la contraseña** que le asignes al usuario administrador oficial (`postgres`).
   - Se instalará también **pgAdmin 4** (la interfaz gráfica para ver la base de datos).

---

## 2. Preparación Base de Datos (PostgreSQL)

1. Abre **pgAdmin 4** (se instaló junto a PostgreSQL).
2. Ingresa la contraseña maestra para conectarte al servidor local.
3. Haz clic derecho en **Databases > Create > Database**.
4. Nómbrala `ordenes_compras` y dale clic en **Guardar/Save**.

---

## 3. Preparación del Proyecto

1. Copia toda la carpeta de tu proyecto (`ordenes-de-compra`) a la PC del cliente (ej. `C:\Proyectos\ordenes-de-compra`).
   
> [!WARNING]
> **No copies** las carpetas `node_modules` ni `.next` desde tu computadora a la del cliente. Estas carpetas contienen archivos compilados para *tu* sistema operativo y podrían causar errores. Cópialo sin esas carpetas.

2. En la carpeta que acabas de copiar al PC del cliente, asegúrate de que exista el archivo `.env`. Edítalo (con el bloc de notas u otro editor) para que tenga los datos correctos:

```env
# Reemplaza 'password_del_cliente' por la contraseña que pusiste al instalar PostgreSQL
DATABASE_URL="postgresql://postgres:password_del_cliente@localhost:5432/ordenes_compras?schema=public"
```

---

## 4. Instalación y Configuración del Entorno

1. Abre la terminal de Windows (**PowerShell** o **Símbolo del sistema / CMD**).
2. Navega hasta la carpeta del proyecto:
   ```bash
   cd C:\Proyectos\ordenes-de-compra
   ```
3. Instala todas las dependencias del proyecto:
   ```bash
   npm install
   ```
4. **Restaurar la estructura de la base de datos (¡Muy Importante!):**
   Dado que tu base de datos utiliza **funciones y triggers nativos**, el comando estándar de Prisma (`db push`) **NO sirve** por sí solo (Prisma ignora triggers y funciones). Debes restaurar el script SQL manualmente:
   - Ve a **pgAdmin 4**, haz clic derecho sobre la base de datos `ordenes_compras` y selecciona **Query Tool (Herramienta de Consultas)**.
   - Abre el archivo `base de datos.txt` que está en la carpeta de tu proyecto, copia **todo** su contenido y pégalo en el Query Tool.
   - Presiona el botón superior de **Play (Execute/F5)** para ejecutar el script. Esto creará todas las tablas, relaciones, **funciones y triggers** correctamente.

5. Genera el cliente de Prisma para conectar el código a la base de datos:
   ```bash
   npx prisma generate
   ```

---

## 5. Compilación y Arranque (Modo Producción)

Para que el proyecto sea rápido y funcione óptimamente como uso diario para el cliente, se debe usar la versión compilada y no el modo desarrollador (`npm run dev`).

1. En la misma consola, compila el proyecto:
   ```bash
   npm run build
   ```
2. Una vez que termine de compilar (puede tomar unos minutos), levanta el servidor de producción:
   ```bash
   npm run start
   ```
3. ¡Listo! El cliente puede abrir su navegador web y escribir: `http://localhost:3000`

---

## 6. (Opcional, pero Recomendado) Ejecución en Segundo Plano

Si cierras la ventana de la consola negra, el sistema web dejará de funcionar. Para evitar que el cliente tenga que abrir la consola todos los días o si reinicia el equipo, puedes instalar **PM2** para que se ejecute siempre de fondo.

1. Instala PM2 globalmente en la computadora del cliente:
   ```bash
   npm install -g pm2
   ```
2. Inicia un cmd como administrador en la carpeta del proyecto y ejecuta:
   ```bash
   pm2 start npm --name "sistema-ordenes" -- run start
   pm2 startup
   pm2 save
   ```

Con esto, por más de que se reinicie la PC, el gestor de órdenes de compra siempre estará disponible en `http://localhost:3000`.
