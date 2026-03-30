# Guía de Instalación del Sistema de Órdenes de Compra

¡Hola! Esta guía te ayudará a instalar y encender el sistema en tu computadora por primera vez. Sigue los pasos uno a uno, sin prisas.

---

## 1. Descargar los programas base

Tu computadora necesita dos "motores" para funcionar: uno para el sistema y otro para guardar la información.

1. **Instalar Node.js:** Entra a [nodejs.org](https://nodejs.org/es/download) y descarga el botón que dice **"LTS"**. Ábrelo e instálalo dándole "Siguiente" a todo.
![Descargar para windows](images/descargar1.png)
2. **Instalar la Base de Datos:** Entra a [postgresql.org/download/windows](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) y descarga el instalador. Instálalo dando "Siguiente". 
   > ⚠️ **¡ATENCIÓN!** Durante la instalación, te pedirá que inventes una contraseña. **Anótala y guárdala muy bien**, porque es la llave de tu información y la usaremos en el paso 3.

![Descargar para windows](images/descargar2.jpeg)

---

## 2. Descargar el Sistema

1. Ve al enlace que te proporcionó el desarrollador (el archivo del sistema en GitHub).
2. Busca el botón verde que dice **"Code"** y haz clic en **"Download ZIP"**.
3. Se descargará un archivo comprimido. Búscalo en tus descargas, dale clic derecho y elige **"Extraer todo"**.
4. Mueve esa carpeta extraída a un lugar seguro, como tus *Documentos* o tu disco *C:*.

![Descargar para windows](images/descargar3.jpeg)
---

## 3. Conectar el Sistema con la Base de Datos

Ahora vamos a decirle al sistema cuál es la contraseña que inventaste en el primer paso.

1. Entra a la carpeta del sistema que acabas de descomprimir.
2. Abre el **Bloc de notas** en tu computadora.
3. Copia el siguiente texto y pégalo en el bloc de notas, pero reemplazando `PON_TU_CONTRASEÑA_AQUI` por la contraseña que anotaste en el paso 1:

```env
DATABASE_URL="postgresql://postgres:PON_TU_CONTRASEÑA_AQUI@localhost:5432/ordenes_compras?schema=public"
```

4. En el Bloc de notas, ve a **Archivo > Guardar como...**
5. Busca la carpeta del sistema. En "Tipo", selecciona **"Todos los archivos"**.
6. En "Nombre de archivo" escribe exactamente: `.env` (con el punto al principio). Clic en guardar.

---

## 4. Crear la estructura de la base de datos

1. Busca en tu computadora un programa llamado **pgAdmin 4** (se instaló en el paso 1, tiene el icono de un elefante) y ábrelo. Pon la contraseña que inventaste.
2. A la izquierda, verás un menú. Despliega **"Servers"**, dale clic derecho a **"Databases" > "Create" > "Database"**.
3. Ponle de nombre exactamente: `ordenes_compras` y dale a Guardar.
4. Ahora dale clic a esa nueva base de datos (`ordenes_compras`) y luego arriba, en la barra superior del programa, haz clic en el botón que parece un cilindro o un rayo y se llama **"Query Tool"** (Herramienta de Consultas). Se abrirá un panel en blanco.
5. Abre la carpeta de tu sistema y busca un archivo llamado `base de datos.txt`. Ábrelo, copia todo el texto y pégalo en el panel en blanco del pgAdmin.
6. Dale al botón de **Play** (el triángulo que apunta a la derecha) en la parte de arriba del pgAdmin. Con esto se crearon todas las tablas necesarias.

---

## 5. Encender el sistema

1. Ve a la carpeta de tu sistema.
2. Haz clic en la **barra de direcciones** de arriba (donde dice la ruta de la carpeta, por ejemplo: _C:\Usuarios\...\ordenes-de-compra_), borra todo lo que dice ahí, escribe **`cmd`** y presiona **Enter**. Se abrirá una ventana negra con letras blancas.
3. Escribe los siguientes comandos, presionando **Enter** después de cada uno y esperando a que terminen de hacer lo suyo (algunos toman un minuto):

   Escribe esto y presiona Enter:
   ```bash
   npm install
   ```
   Luego esto y presiona Enter:
   ```bash
   npx prisma generate
   ```
   Luego esto (preparará el sistema para ser veloz):
   ```bash
   npm run build
   ```
   Por último, para encenderlo, escribe:
   ```bash
   npm run start
   ```

> ⚠️ **Importante:** Mientras el sistema esté en uso, ¡esa ventanita negra debe quedarse abierta! Puedes minimizarla, pero no la cruces.

---

## 6. ¡A trabajar!

Tu sistema ya está encendido. Solo debes abrir tu navegador de internet favorito (Chrome, Edge, Safari) y escribir en la barra de direcciones:

**http://localhost:3000**

¡Listo! Ya puedes empezar a usar tu sistema de órdenes de compra.
