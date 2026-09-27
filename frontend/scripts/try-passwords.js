const { PrismaClient } = require('@prisma/client');

const candidates = [
  'admin',
  '1234',
  '123456',
  'root',
  'agendatepy',
  'postgres123',
  'acer',
  'password',
  '12345678',
  '123',
];

async function tryPassword(pw) {
  const url = `postgresql://postgres:${encodeURIComponent(pw)}@localhost:5432/postgres`;
  const p = new PrismaClient({
    datasources: { db: { url } },
  });
  try {
    await p.$connect();
    await p.$disconnect();
    return true;
  } catch (err) {
    await p.$disconnect();
    return false;
  }
}

async function run() {
  for (const pw of candidates) {
    process.stdout.write(`Probando contraseña '${pw}'... `);
    const ok = await tryPassword(pw);
    if (ok) {
      console.log('✅ ÉXITO!');
      console.log(`LA CONTRASEÑA ES: ${pw}`);
      process.exit(0);
    } else {
      console.log('❌');
    }
  }
  console.log('Ninguna de las contraseñas comunes funcionó.');
  process.exit(1);
}

run();
