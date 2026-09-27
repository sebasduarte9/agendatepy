const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('Testing connection to DATABASE_URL:', process.env.DATABASE_URL);
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ CONECTADO CON ÉXITO A POSTGRESQL!');
    const res = await prisma.$queryRaw`SELECT version();`;
    console.log('Versión de PostgreSQL:', res);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    process.exit(1);
  }
}

test();
