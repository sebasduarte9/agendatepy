import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TIMEZONE = "America/Asuncion";
// Paraguay no usa horario de verano. La hora civil 09:00 es 12:00 UTC.
const ASUNCION_OFFSET = "-03:00";

const WEEKDAYS = [1, 2, 3, 4, 5] as const;
const SHIFT_START = new Date(Date.UTC(1970, 0, 1, 9, 0, 0));
const SHIFT_END = new Date(Date.UTC(1970, 0, 1, 18, 0, 0));

async function main() {
  const today = civilToday(TIMEZONE);
  const corteStart = zoned(today, "10:00");
  const barbaStart = zoned(today, "15:00");

  await prisma.$transaction(async (tx) => {
    await tx.appointment.deleteMany();
    await tx.staffService.deleteMany();
    await tx.staffSchedule.deleteMany();
    await tx.product.deleteMany();
    await tx.service.deleteMany();
    await tx.staff.deleteMany();
    await tx.tenant.deleteMany();

    const tenant = await tx.tenant.create({
      data: {
        name: "Barbería Los Muchachos",
        slug: "barberia",
        subdomain: "barberia",
        timezone: TIMEZONE,
        settings: {
          whatsappPhone: "595981000000",
          slotStepMinutes: 15,
          maxAdvanceDays: 30,
        },
      },
    });

    const [corte, barba] = await Promise.all([
      tx.service.create({
        data: {
          tenantId: tenant.id,
          name: "Corte Clásico",
          durationMinutes: 30,
          price: 80_000,
        },
      }),
      tx.service.create({
        data: {
          tenantId: tenant.id,
          name: "Barba y Pelo",
          durationMinutes: 60,
          price: 120_000,
        },
      }),
    ]);

    const [marcos, luis] = await Promise.all([
      tx.staff.create({
        data: { tenantId: tenant.id, name: "Marcos Benítez", active: true },
      }),
      tx.staff.create({
        data: { tenantId: tenant.id, name: "Luis Ayala", active: true },
      }),
    ]);

    const staff = [marcos, luis];
    const services = [corte, barba];

    await tx.staffService.createMany({
      data: staff.flatMap((member) =>
        services.map((service) => ({
          staffId: member.id,
          serviceId: service.id,
        })),
      ),
    });

    await tx.staffSchedule.createMany({
      data: staff.flatMap((member) =>
        WEEKDAYS.map((dayOfWeek) => ({
          staffId: member.id,
          dayOfWeek,
          startTime: SHIFT_START,
          endTime: SHIFT_END,
        })),
      ),
    });

    await tx.appointment.createMany({
      data: [
        {
          tenantId: tenant.id,
          staffId: marcos.id,
          serviceId: corte.id,
          clientName: "Ana Gómez",
          clientPhone: "595981111111",
          startTime: corteStart,
          endTime: new Date(corteStart.getTime() + corte.durationMinutes * 60_000),
          status: "CONFIRMED",
        },
        {
          tenantId: tenant.id,
          staffId: luis.id,
          serviceId: barba.id,
          clientName: "Pedro Ramírez",
          clientPhone: "595982222222",
          startTime: barbaStart,
          endTime: new Date(barbaStart.getTime() + barba.durationMinutes * 60_000),
          status: "PENDING_ACTION",
          expiresAt: new Date(Date.now() + 30 * 60_000),
        },
      ],
    });
  });

  console.log("Seed listo.");
  console.log("  tenant     Barbería Los Muchachos");
  console.log("  subdomain  barberia  →  http://barberia.localhost:3000/reservar");
  console.log("  admin      http://barberia.localhost:3000/admin");
  console.log(`  hoy        ${today} (${TIMEZONE})`);
  console.log("  confirmed  10:00 Corte Clásico · Marcos");
  console.log("  pending    15:00 Barba y Pelo · Luis (vence en 30 min)");
}

function civilToday(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error(`No se pudo resolver la fecha civil en ${timeZone}`);
  }
  return `${year}-${month}-${day}`;
}

function zoned(civilDate: string, hoursMinutes: string): Date {
  return new Date(`${civilDate}T${hoursMinutes}:00${ASUNCION_OFFSET}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
