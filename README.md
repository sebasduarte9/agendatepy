# 📅 AgendatePY - Sistema de Agendamiento (Proyecto Privado)

¡Bienvenido al repo! Aquí está todo lo que necesitas saber para que podamos hacer *vibecoding* con Cursor sin pisarnos el código.

## 🚀 1. Tu primera vez: Descargar e Instalar

Abre la terminal de Cursor en tu PC y ejecuta esto:

1. Clona el proyecto en tu computadora:
   `git clone https://github.com/[TU_USUARIO]/agendatepy.git`
2. Entra a la carpeta del proyecto:
   `cd agendatepy`
3. Entra al frontend e instala las dependencias:
   `cd frontend`
   `npm install`
4. Levanta el servidor local para ver la web:
   `npm run dev`
   *(Abre http://localhost:3000 en tu navegador)*

---

## 💻 2. Nuestro flujo de trabajo diario

**NUNCA programes directamente en la rama `main`.** Sigue siempre esta rutina:

**Paso A: Actualizar tu PC con lo último**
Antes de empezar a programar, baja mis cambios:
`git checkout main`
`git pull origin main`

**Paso B: Crear tu rama de trabajo**
Crea un espacio aislado para lo que vayas a hacer hoy:
`git checkout -b feature/nombre-de-tu-tarea`

**Paso C: ¡Vibecoding! 🪄**
Usa Cursor a tope (`Cmd+I` para Composer, `Cmd+K` para el chat).

**Paso D: Guardar y subir a GitHub**
Cuando tu código funcione bien:
`git add .`
`git commit -m "Descripción clara de lo que hiciste"`
`git push origin feature/nombre-de-tu-tarea`

**Paso E: Unir los cambios (Merge)**
Ve a GitHub.com, haz clic en **"Compare & pull request"**. Revisamos juntos que todo esté bien, y lo unimos al `main`. 

---

## 🚨 Reglas de Oro
1. **El .env no se sube:** Nunca subas contraseñas a GitHub.
2. **Dudas o Bugs raros:** Si algo se rompe, iniciamos sesión en Live Share desde Cursor y lo resolvemos en la misma pantalla.
