# Agendatepy · Glassy Studio

El catálogo original fue adaptado al diseño Glassy y ampliado siguiendo `ESPECIFICACION_GLASSY.md`, copiado del documento completo que agregaste en la carpeta principal. Se conservan la marca, el español y los importes en guaraníes.

## Abrir

Haz doble clic en `ABRIR_CATALOGO.command` o abre `index.html` en tu navegador. No hay que instalar ni compilar nada. Fuentes, iconos y estilos están incluidos; funciona sin internet.

Si prefieres servirlo por HTTP, abre una terminal en esta carpeta y ejecuta `npm start`. Requiere Node.js 22 o posterior, pero no requiere instalar las dependencias de prueba. El servidor escucha únicamente en este equipo. La dirección se muestra en la terminal.

## Catálogo y módulos

El catálogo mantiene cinco familias: vista general, fundamentos, controles, datos y negocio, y feedback. Incluye botones, estados, tipografía, tokens, formularios, selectores, switches, sliders, tablas, tarjetas, gráficos, orbes, chat, checklist, modales, buscador y notificaciones.

La navegación integra 15 secciones:

1. Catálogo de elementos.
2. Vista general del negocio.
3. Agenda en día, semana y lista.
4. Reserva paso a paso.
5. Caja, cobros y egresos.
6. Clientes y CRM.
7. Servicios.
8. Productos e inventario.
9. Simulador de WhatsApp IA.
10. Equipo y comisiones.
11. Métricas y exportación CSV.
12. Fidelización y recompensas.
13. Apariencia y vista previa del portal.
14. Portal local de reservas.
15. Ajustes del negocio.

## Flujos conectados

- Una reserva aparece en la agenda, con validación de profesional, duración, horario del negocio, citas existentes y bloqueos.
- Las citas pendientes pueden reprogramarse desde su ficha o arrastrándolas en la vista diaria.
- Cobrar una cita genera un movimiento, acumula puntos y un sello, y calcula la comisión correspondiente. No permite repetir el cobro.
- La caja admite apertura, arqueo ciego, cierre y egresos. Una reapertura no vuelve a contar movimientos anteriores.
- Vender un producto descuenta stock y registra su comisión; no admite cantidades superiores al inventario disponible.
- Las liquidaciones marcan las comisiones como pagadas y generan un comprobante imprimible; no pueden liquidarse dos veces.
- Los canjes descuentan puntos o sellos y se registran en el historial.
- Clientes, notas, servicios, profesionales, precios y preferencias se pueden editar y conservar.
- Búsqueda universal con Cmd/Ctrl + K: secciones, clientes y citas.

## Diseño y movimiento

- Cristal oscuro Obsidian y claro Frosty.
- Naranja inicial, seis acentos y color personalizado.
- Fondo atmosférico animado íntegramente en CSS, sin fotografías.
- Rail de 66 a 242 px que conserva la altura y permite desplazarse por sus accesos.
- Navegación inferior y drawer en móvil.
- Tilt con el cursor, reflejos, orbes orgánicos, entrada de paneles, trazado de gráficos y barras progresivas.
- Controles de desenfoque, fuente y densidad; desactivación de animaciones y respeto de `prefers-reduced-motion`.
- Tabs con flechas de teclado, foco visible, etiquetas y formularios con errores contextualizados.

## Datos y alcance

Los datos iniciales son ejemplos. El estado se guarda en localStorage bajo `agendatepy-glassy-v2`; puedes exportarlo como JSON desde Ajustes. Abrir por archivo y abrir por HTTP utiliza almacenamientos distintos. Las pruebas automatizadas utilizan un DOM aislado y no alteran tus datos del navegador.

Es un prototipo funcional local, no un SaaS con servidor, autenticación o múltiples usuarios. WhatsApp es un simulador por reglas; no usa IA real, no genera QR de conexión y no envía mensajes. Los cobros y liquidaciones son registros de demostración, no pagos bancarios. Los comprobantes se imprimen o guardan como PDF desde el diálogo del navegador y no tienen validez fiscal.

Las imágenes de logo, banner y producto se guardan localmente (PNG/JPG/WebP, máximo 1 MB cada una). El almacenamiento disponible depende del navegador; una advertencia indica si no se pudo guardar. No hay un servicio de recorte de fondo con IA. El comprobante opcional de una reserva conserva su nombre, no el archivo completo. La tarjeta de fidelización descargable es informativa; no es un pase firmado de Apple/Google Wallet.

## Archivos

- `index.html`: estructura y entrada.
- `styles.css`: sistema visual, temas, responsive y animaciones.
- `data.js`: datos, estado y validaciones de negocio.
- `views.js`: catálogo y pantallas.
- `app.js`: interacciones, formularios, navegación y guardado.
- `assets/`: fuentes locales y marca.
- `ESPECIFICACION_GLASSY.md`: especificación completa usada como referencia.
- `ELEMENTOS_SISTEMA.md`: documento que ya estaba dentro del catálogo, conservado.
- `respaldo-original/`: copia del catálogo previo a esta edición.
- `pruebas/verificar.cjs`: pruebas reproducibles.
- `VALIDACION.md`: resultado y límites de la verificación.

## Pruebas

Con Node.js 22 o posterior, ejecuta `npm install` y luego `npm test`. Las dependencias son únicamente para pruebas; la web no las necesita para abrirse.
