# Interfas Glassy

Abre `index.html` con Chrome, Safari o Edge. También puedes hacer doble clic en `ABRIR WEB.command`. No necesitas instalar dependencias ni compilar nada.

## Qué incluye

- **Finance:** My Dashboard, Cards & Accounts, Wallets & Portfolio, Documents & Statements y Transactions.
- **Creator:** Channel Analytics, Content Studio, Growth & Trends y Revenue & Wallet.
- **Gaming:** panel original, biblioteca y logros.
- **Workspace:** tablero de tareas con arrastrar y soltar, calendario, colección de componentes y ajustes.
- Naranja inicial; seis colores de acento y selector personalizado. Ajustes de desenfoque, opacidad, animaciones y densidad.
- Transiciones entre vistas, trazado progresivo de gráficos, barras animadas, esfera orgánica giratoria, brillos ambientales, tarjetas con inclinación y estados hover.
- Búsqueda global con Cmd/Ctrl + K, notificaciones, ventanas modales, filtros, exportación CSV, objetivos de ahorro y operaciones financieras simuladas.
- Adaptación a móvil con navegación inferior.

Las preferencias, tareas, eventos, objetivos y operaciones de demostración se guardan en localStorage del navegador. La información se conserva en ese navegador y origen; abrir por archivo y por servidor local usa almacenamientos distintos.

## Archivos

- `index.html`: entrada de la web.
- `styles.css`: diseño, efectos de cristal, responsive y animaciones.
- `app.js`: navegación, componentes y comportamiento.
- `assets/`: imágenes locales.
- `referencias/`: los dos videos originales.

## Alcance de la reproducción

Se recrearon las nueve vistas observables de los videos y se añadieron siete vistas coherentes con el mismo estilo. Las imágenes de personajes se recortaron de los videos facilitados; su nitidez está limitada por la resolución original. Algunos textos pequeños y duraciones de animación se aproximaron. El fondo de oficina es una imagen de Unsplash (https://images.unsplash.com/photo-1497366754035-f200968a6e72), elegida para recrear el ambiente.

Las tarjetas, finanzas, cotizaciones, estadísticas, juegos y notificaciones contienen datos de demostración. No se conecta con bancos ni se ejecutan juegos. Las acciones de transferencia, cambio de divisa y retiro son simulaciones locales. Al seleccionar un archivo se guarda su nombre y metadatos, no su contenido; la descarga de un documento genera un resumen de demostración, no un PDF original.

Las fuentes DM Sans y Manrope y todas las imágenes están guardadas localmente. La web puede abrirse sin conexión a internet. Licencias de las fuentes en `assets/fonts/`.

Para servirla opcionalmente por HTTP, desde esta carpeta: `/usr/bin/python3 -m http.server 8765` y abre http://localhost:8765.
