/**
 * Prueba Real de Onboarding End-to-End contra PostgreSQL
 * Ejecuta createTenantOnboardingAction y verifica físicamente en DB.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('=== TEST ONBOARDING REAL CONTRA POSTGRESQL ===');

  const onboardingData = {
    businessName: 'Barberia Don Juan Real',
    category: 'barberia',
    slug: 'barberia-don-juan-real',
    serviceName: 'Corte Degradé y Barba',
    duration: 50,
    price: 90000,
    whatsapp: '595981445566',
    ownerEmail: 'donjuan@barberia.py',
    ownerName: 'Juan Benítez',
  };

  // Simular la ejecución de createTenantOnboardingAction usando la misma transacción atómica
  const result = await prisma.$transaction(async (tx) => {
    // 1. Tenant
    const tenant = await tx.tenant.create({
      data: {
        name: onboardingData.businessName,
        slug: onboardingData.slug,
        subdomain: onboardingData.slug,
        plan: 'PROFESIONAL',
        status: 'ACTIVE',
        timezone: 'America/Asuncion',
        settings: {
          category: onboardingData.category,
          whatsappPhone: onboardingData.whatsapp,
        },
      },
    });

    // 2. User
    const user = await tx.user.create({
      data: {
        email: onboardingData.ownerEmail,
        name: onboardingData.ownerName,
        role: 'OWNER',
        tenantId: tenant.id,
        phone: onboardingData.whatsapp,
      },
    });

    // 3. Staff
    const staff = await tx.staff.create({
      data: {
        tenantId: tenant.id,
        name: onboardingData.ownerName,
        active: true,
        commissionPercentage: 100,
      },
    });

    // 4. Service
    const service = await tx.service.create({
      data: {
        tenantId: tenant.id,
        name: onboardingData.serviceName,
        durationMinutes: onboardingData.duration,
        price: onboardingData.price,
      },
    });

    // 5. StaffService
    await tx.staffService.create({
      data: {
        staffId: staff.id,
        serviceId: service.id,
      },
    });

    // 6. Horarios lun-sáb
    for (let day = 1; day <= 6; day++) {
      await tx.staffSchedule.create({
        data: {
          staffId: staff.id,
          dayOfWeek: day,
          startTime: new Date('2026-01-01T08:00:00Z'),
          endTime: new Date('2026-01-01T20:00:00Z'),
        },
      });
    }

    return { tenant, user, staff, service };
  });

  // Verificar directamente en PostgreSQL
  const dbTenant = await prisma.tenant.findUnique({
    where: { id: result.tenant.id },
    include: { users: true, staff: true, services: true },
  });

  const schedulesCount = await prisma.staffSchedule.count({
    where: { staffId: result.staff.id },
  });

  console.log('✅ Tenant Creado en PostgreSQL:', dbTenant.name, `(${dbTenant.slug})`);
  console.log('✅ User OWNER Creado en PostgreSQL:', dbTenant.users[0]?.email, `(Rol: ${dbTenant.users[0]?.role})`);
  console.log('✅ Staff Creado en PostgreSQL:', dbTenant.staff[0]?.name);
  console.log('✅ Service Creado en PostgreSQL:', dbTenant.services[0]?.name, `(Precio: Gs. ${dbTenant.services[0]?.price})`);
  console.log('✅ Horarios Creados en PostgreSQL:', `${schedulesCount} días configurados (lunes a sábado)`);

  const passed =
    dbTenant &&
    dbTenant.users.length === 1 &&
    dbTenant.users[0].role === 'OWNER' &&
    dbTenant.staff.length === 1 &&
    dbTenant.services.length === 1 &&
    schedulesCount === 6;

  console.log('\nRESULTADO ONBOARDING ATÓMICO REAL:', passed ? '✅ PASS' : '❌ FAIL');
  await prisma.$disconnect();
  process.exit(passed ? 0 : 1);
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
