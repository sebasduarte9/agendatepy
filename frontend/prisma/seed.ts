import { PrismaClient, UserRole, CashMovementType, CommissionStatus } from "@prisma/client";

const prisma = new PrismaClient();

const TIMEZONE = "America/Asuncion";
const ASUNCION_OFFSET = "-03:00";

const WEEKDAYS = [1, 2, 3, 4, 5, 6] as const;
const SHIFT_START = new Date(Date.UTC(1970, 0, 1, 9, 0, 0));
const SHIFT_END = new Date(Date.UTC(1970, 0, 1, 19, 0, 0));

async function main() {
  const today = civilToday(TIMEZONE);
  const corteStart = zoned(today, "10:00");
  const barbaStart = zoned(today, "15:00");

  await prisma.$transaction(async (tx) => {
    await tx.commission.deleteMany();
    await tx.cashMovement.deleteMany();
    await tx.client.deleteMany();
    await tx.loyaltyReward.deleteMany();
    await tx.otpCode.deleteMany();
    await tx.user.deleteMany();
    await tx.appointment.deleteMany();
    await tx.staffService.deleteMany();
    await tx.staffSchedule.deleteMany();
    await tx.product.deleteMany();
    await tx.service.deleteMany();
    await tx.staff.deleteMany();
    await tx.tenant.deleteMany();

    // 1. Crear Tenant Principal
    const tenant = await tx.tenant.create({
      data: {
        name: "Barbería Los Muchachos",
        slug: "barberia",
        subdomain: "barberia",
        plan: "PROFESIONAL",
        status: "ACTIVE",
        timezone: TIMEZONE,
        settings: {
          whatsappPhone: "595981000000",
          slotStepMinutes: 15,
          maxAdvanceDays: 30,
          sendwoConfig: {
            apiUrl: "https://bot.sendwo.com",
            apiKey: "demo-sendwo-key-paraguay-2026",
            connected: true,
          },
          upayConfig: {
            merchantId: "UPAY-PY-8832",
            enabled: true,
            sandbox: true,
          },
        },
      },
    });

    // 2. Crear Usuarios con Roles
    // SuperAdmin
    await tx.user.create({
      data: {
        email: "admin@agendate.py",
        name: "Administrador General",
        role: UserRole.SUPERADMIN,
        phone: "595981999999",
        optInMarketing: true,
      },
    });

    // Owner del tenant
    const ownerUser = await tx.user.create({
      data: {
        email: "marcos@barberia.py",
        name: "Marcos Benítez",
        role: UserRole.OWNER,
        tenantId: tenant.id,
        phone: "595981000000",
        optInMarketing: true,
      },
    });

    // 3. Crear Servicios
    const [corte, barba, combo] = await Promise.all([
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
          name: "Perfilado de Barba",
          durationMinutes: 30,
          price: 50_000,
        },
      }),
      tx.service.create({
        data: {
          tenantId: tenant.id,
          name: "Combo Corte + Barba VIP",
          durationMinutes: 60,
          price: 120_000,
        },
      }),
    ]);

    // 4. Crear Staff
    const [marcos, luis] = await Promise.all([
      tx.staff.create({
        data: {
          tenantId: tenant.id,
          name: "Marcos Benítez",
          active: true,
          commissionPercentage: 50,
        },
      }),
      tx.staff.create({
        data: {
          tenantId: tenant.id,
          name: "Luis Ayala",
          active: true,
          commissionPercentage: 45,
        },
      }),
    ]);

    // Enlazar usuario owner a su staff
    await tx.user.update({
      where: { id: ownerUser.id },
      data: { staffId: marcos.id },
    });

    // Staff user
    await tx.user.create({
      data: {
        email: "luis@barberia.py",
        name: "Luis Ayala",
        role: UserRole.STAFF,
        tenantId: tenant.id,
        staffId: luis.id,
        phone: "595982333444",
        optInMarketing: false,
      },
    });

    // 5. Vincular Staff con Servicios
    const staff = [marcos, luis];
    const services = [corte, barba, combo];

    await tx.staffService.createMany({
      data: staff.flatMap((member) =>
        services.map((service) => ({
          staffId: member.id,
          serviceId: service.id,
        })),
      ),
    });

    // 6. Horarios de Staff
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

    // 7. Citas
    const apt1 = await tx.appointment.create({
      data: {
        tenantId: tenant.id,
        staffId: marcos.id,
        serviceId: combo.id,
        clientName: "Carlos Giménez",
        clientPhone: "595981444333",
        startTime: corteStart,
        endTime: new Date(corteStart.getTime() + combo.durationMinutes * 60_000),
        status: "CONFIRMED",
      },
    });

    await tx.appointment.create({
      data: {
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
    });

    // 8. Clientes CRM con puntos de fidelización
    await tx.client.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: "Carlos Giménez",
          phone: "595981444333",
          email: "carlos.gimenez@gmail.com",
          points: 320,
          totalSpent: 480_000,
          notes: "Prefiere café cortado y fade medio.",
        },
        {
          tenantId: tenant.id,
          name: "María José Duarte",
          phone: "595982777888",
          email: "mariajose@hotmail.com",
          points: 150,
          totalSpent: 240_000,
          notes: "Reserva siempre los viernes por la tarde.",
        },
        {
          tenantId: tenant.id,
          name: "Esteban Franco",
          phone: "595983999000",
          points: 80,
          totalSpent: 160_000,
        },
      ],
    });

    // 9. Movimientos de Caja
    await tx.cashMovement.createMany({
      data: [
        {
          tenantId: tenant.id,
          type: CashMovementType.INCOME,
          amount: 120_000,
          category: "Servicio",
          description: "Combo Corte + Barba VIP - Carlos Giménez",
          paymentMethod: "uPay / Tarjeta",
          createdBy: "Marcos Benítez",
        },
        {
          tenantId: tenant.id,
          type: CashMovementType.INCOME,
          amount: 80_000,
          category: "Servicio",
          description: "Corte Clásico - Cliente Mostrador",
          paymentMethod: "Efectivo",
          createdBy: "Luis Ayala",
        },
        {
          tenantId: tenant.id,
          type: CashMovementType.EXPENSE,
          amount: 45_000,
          category: "Insumos",
          description: "Navajas descartables y talco mentolado",
          paymentMethod: "Efectivo",
          createdBy: "Marcos Benítez",
        },
      ],
    });

    // 10. Comisiones
    await tx.commission.create({
      data: {
        tenantId: tenant.id,
        staffId: marcos.id,
        appointmentId: apt1.id,
        amount: 60_000,
        percentage: 50,
        status: CommissionStatus.PENDING,
      },
    });

    // 11. Recompensas de Fidelización
    await tx.loyaltyReward.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: "Corte Clásico Gratis",
          pointsRequired: 300,
          discountGuaranies: 80_000,
          active: true,
        },
        {
          tenantId: tenant.id,
          name: "50% Descuento en Barba",
          pointsRequired: 150,
          discountGuaranies: 25_000,
          active: true,
        },
      ],
    });

    // 12. Productos
    await tx.product.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: "Pomada Efecto Mate Premium (100g)",
          price: 65_000,
          isActive: true,
        },
        {
          tenantId: tenant.id,
          name: "Aceite Hidratante para Barba (30ml)",
          price: 55_000,
          isActive: true,
        },
      ],
    });
  });

  console.log("Seed completado exitosamente con base de datos sincronizada.");
  console.log("  SuperAdmin : admin@agendate.py (SUPERADMIN)");
  console.log("  Owner      : marcos@barberia.py (OWNER)");
  console.log("  Staff      : luis@barberia.py (STAFF)");
  console.log("  Tenant     : barberia (Barbería Los Muchachos)");
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
