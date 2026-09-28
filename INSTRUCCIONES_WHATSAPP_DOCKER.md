# 🚀 Guía de Activación de Pasarela WhatsApp con Docker (Para Derlis y Equipo de Servidores)

Esta guía documenta la infraestructura del servicio centralizado de WhatsApp para **AgendatePY**.

---

## 📌 Arquitectura y Principio de Diseño

1. **Invisible para los clientes del SaaS:**
   - Los negocios y usuarios finales **nunca** instalan Docker, no configuran servidores ni ven API keys.
   - Para ellos, la experiencia es 100% nativa: abren su panel en AgendatePY, ven el código QR, lo escanean con su teléfono desde WhatsApp y quedan vinculados.

2. **Centralizado en el Servidor (VPS / Docker):**
   - AgendatePY cuenta con su propio microservicio de pasarela basado en `atendai/evolution-api:v2.1.2`, configurado en el archivo [`docker-compose.evolution.yml`](./docker-compose.evolution.yml).
   - Se encarga de gestionar los sockets de WhatsApp Web, generar los códigos QR y enviar los recordatorios de turnos.

---

## 🛠️ Paso a Paso para Activar la Pasarela

### 1. Iniciar el Contenedor Docker

En la raíz del proyecto (donde está instalado Docker Engine), ejecutar:

```bash
docker compose -f docker-compose.evolution.yml up -d
```

Para verificar que el contenedor esté corriendo correctamente:

```bash
docker compose -f docker-compose.evolution.yml ps
```

### 2. Variables de Entorno en el Frontend (`frontend/.env`)

Asegurarse de tener las siguientes variables configuradas en el archivo `.env` del servidor:

```env
# URL de la pasarela local o en el VPS
EVOLUTION_API_URL=http://localhost:8080

# Llave de autenticación configurada en el compose
EVOLUTION_API_KEY=agendatepy_whatsapp_secure_key_2026

# Nombre de instancia por defecto
EVOLUTION_INSTANCE=agendatepy
```

*(En producción sobre VPS con dominio público, podés exponerlo tras Nginx en `https://whatsapp.agendatepy.com`).*

---

## 🔍 Comandos de Prueba y Verificación

### Probar conectividad con la API:
```bash
curl -H "apikey: agendatepy_whatsapp_secure_key_2026" http://localhost:8080/instance/fetchInstances
```

### Ver logs en tiempo real:
```bash
docker compose -f docker-compose.evolution.yml logs -f
```

### Detener el servicio:
```bash
docker compose -f docker-compose.evolution.yml down
```

---

## 📡 Webhook Receptor en AgendatePY

El contenedor está preconfigurado para enviar los eventos entrantes (mensajes de clientes, cambios de estado de conexión) directamente a:

```
http://host.docker.internal:3000/api/webhooks/whatsapp
```

En producción en el servidor, este endpoint corresponde a:
`https://agendatepy.com/api/webhooks/whatsapp`

---

## ✅ Lista de Chequeo para Derlis:

- [ ] Docker corriendo en el servidor / equipo local.
- [ ] Ejecutar `docker compose -f docker-compose.evolution.yml up -d`.
- [ ] Verificar que `http://localhost:8080` responda estado 200.
- [ ] Verificar variables en `frontend/.env`.
- [ ] Listo: la aplicación Next.js despachará los mensajes de confirmación automáticamente a través de la pasarela.
