# Verificación — Agendatepy Glassy

Fecha: 10 de octubre de 2026.

## Comprobado mediante Node.js y un DOM aislado

- Las 15 rutas se generan sin errores de ejecución ni IDs duplicados.
- Las cinco familias del catálogo se generan correctamente.
- La hoja CSS se procesa sin errores de sintaxis en el parser de prueba.
- Todos los disparadores estáticos de acción tienen manejador.
- El cambio de acento, modo claro, fuente y desenfoque se guarda.
- La reserva de mostrador crea una cita y deshabilita horarios ocupados.
- El modelo rechaza reservas superpuestas, además de bloquearlas en la interfaz.
- Un cobro actualiza caja, puntos, sellos y comisiones una sola vez.
- La reprogramación rechaza colisiones y citas ya cobradas.
- Las reservas conservan su duración aunque se edite después el servicio.
- Los bloqueos rechazan colisiones y eliminan disponibilidad.
- El arqueo calcula diferencias; no se admiten cobros con caja cerrada.
- La reapertura excluye movimientos anteriores de la nueva sesión.
- Un egreso no puede superar el efectivo disponible.
- Una venta descuenta stock y rechaza cantidades que lo excedan.
- Una liquidación genera recibo y no puede repetirse.
- Se crean clientes, se guardan notas y funciona la búsqueda.
- Se crean servicios nuevos.
- Las recompensas descuentan puntos y respetan el saldo.
- El simulador de chat responde y respeta el estado en pausa.
- El filtro temporal cambia los datos de métricas.
- El portal crea clientes y citas en la misma agenda local.
- El buscador universal encuentra clientes y citas recién creados.
- Los horarios del negocio no se pueden reducir dejando citas activas fuera de rango.
- Las pestañas del catálogo admiten flechas de teclado y conservan el foco.
- El estado guardado contiene las colecciones y versión esperadas.

## Revisión visual pendiente

No se pudo realizar una inspección visual en un navegador real: la revisión automática de permisos rechazó anteriormente el acceso del agente al navegador local. No se intentó eludir ese bloqueo. Estas pruebas DOM no certifican el encuadre en dispositivos, el renderizado del cristal o la fluidez de las animaciones.

El CSS incluye diseños para desktop, tablet y móvil, así como preferencias de movimiento reducido. Conviene recorrer ambos temas y los flujos principales en el navegador donde se utilizará.
