const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const extensions = await prisma.$queryRawUnsafe(
    "SELECT extname, extversion FROM pg_extension WHERE extname = 'btree_gist';"
  );
  console.log('btree_gist:', extensions);

  const constraints = await prisma.$queryRawUnsafe(
    "SELECT conname, contype FROM pg_constraint WHERE conname = 'appointments_no_staff_overlap';"
  );
  console.log('appointments_no_staff_overlap constraint:', constraints);

  await prisma.$disconnect();
}

run();
