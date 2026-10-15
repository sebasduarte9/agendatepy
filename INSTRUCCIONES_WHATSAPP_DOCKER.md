# WhatsApp y recordatorios en producción

La aplicación y Evolution API se conectan por una red privada de Docker. El QR se vincula desde el panel de cada negocio; no hay que crear instancias manualmente.

## Despliegue

Desde la raíz del proyecto, ejecutá:

```bash
./deploy.sh
```

El script crea `EVOLUTION_API_KEY` y `CRON_SECRET` en el `.env` del servidor si están vacíos, levanta Evolution API y la aplicación, y deja un proceso que revisa los recordatorios cada cinco minutos. Los secretos quedan en el `.env` del servidor y no se muestran en la consola.

Evolution API solo publica el puerto `8081` en `localhost`; la aplicación usa `http://whatsapp-gateway:8080` por la red privada. No abras el puerto 8081 al público.

## Conectar el WhatsApp de un negocio

1. Abrí el panel del negocio y entrá en **Asistente de WhatsApp**.
2. Elegí **Vincular WhatsApp** y escaneá el código QR desde **Dispositivos vinculados** en WhatsApp.
3. Esperá a que el panel muestre el número conectado.

Cada negocio recibe su propia instancia de Evolution API. Los mensajes y recordatorios salen por esa instancia.

## Verificación y diagnóstico

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.evolution.yml ps
docker compose -f docker-compose.prod.yml logs -f reminder-cron
docker compose -f docker-compose.evolution.yml logs -f whatsapp-gateway
```

El proceso `reminder-cron` llama al endpoint protegido con `CRON_SECRET` cada cinco minutos. Si se ejecuta la aplicación en producción fuera de Docker Compose, también debe configurarse `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` y `CRON_SECRET`, y un programador externo debe llamar `GET /api/cron/reminders` cada cinco minutos con `Authorization: Bearer <CRON_SECRET>`.

Para desarrollo local con Next.js ejecutado fuera de Docker, configurá `EVOLUTION_API_URL=http://localhost:8081` en `frontend/.env`; en el Compose de producción se usa la dirección interna del contenedor.
