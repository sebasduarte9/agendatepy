const { PrismaClient } = require('@prisma/client');

const connectionUrl = 'postgresql://postgres:Oracle123*@localhost:5432/postgres';
const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } },
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ ¡CONEXIÓN EXITOSA A POSTGRESQL CON Oracle123*!');
    const version = await prisma.$queryRawUnsafe('SELECT version();');
    console.log('PostgreSQL Version:', version[0].version);

    // Crear la base de datos agendatepy_test si no existe
    try {
      await prisma.$executeRawUnsafe('CREATE DATABASE agendatepy_test;');
      console.log('✅ Base de datos agendatepy_test creada con éxito.');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️ Base de datos agendatepy_test ya existe.');
      } else {
        console.log('Notice al crear DB:', e.message);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
