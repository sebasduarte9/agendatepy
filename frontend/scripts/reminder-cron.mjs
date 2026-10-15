const appUrl = (process.env.APP_URL || "http://app:3000").replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET;
const intervalMs = Number(process.env.INTERVAL_MS || 300_000);

if (!cronSecret) {
  throw new Error("CRON_SECRET es obligatorio para ejecutar recordatorios automáticos.");
}

let running = false;

async function runReminderCheck() {
  if (running) return;
  running = true;

  try {
    const response = await fetch(`${appUrl}/api/cron/reminders`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || result?.ok !== true) {
      throw new Error(result?.error || `El servidor respondió ${response.status}.`);
    }

    console.info(
      `[reminder-cron] ${new Date().toISOString()} — ${result.summary?.totalRemindersSent ?? 0} recordatorios enviados; ` +
        `${result.summary?.processedTenants ?? 0} negocios revisados.`,
    );
  } catch (error) {
    console.error(
      `[reminder-cron] ${new Date().toISOString()} — ${error instanceof Error ? error.message : error}`,
    );
  } finally {
    running = false;
  }
}

void runReminderCheck();
setInterval(() => void runReminderCheck(), intervalMs);
