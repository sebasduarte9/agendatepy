import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Minimal 1x1 transparent PNG buffer (67 bytes) for Apple Wallet required icon/logo assets
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

// Minimal ZIP file generator in pure Node.js buffer format
function createSimpleZip(files: { name: string; content: Buffer }[]): Buffer {
  const localFileHeaders: Buffer[] = [];
  const centralDirectoryHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "utf-8");
    const content = file.content;
    const crc = crc32(content);
    const size = content.length;

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(0, 8); // compression: 0 = stored
    localHeader.writeUInt16LE(0, 10); // time
    localHeader.writeUInt16LE(0, 12); // date
    localHeader.writeUInt32LE(crc, 14); // crc32
    localHeader.writeUInt32LE(size, 18); // compressed size
    localHeader.writeUInt32LE(size, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    localFileHeaders.push(localHeader, content);

    // Central directory header (46 bytes + name)
    const cdHeader = Buffer.alloc(46 + nameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // signature
    cdHeader.writeUInt16LE(20, 4); // version made by
    cdHeader.writeUInt16LE(20, 6); // version needed
    cdHeader.writeUInt16LE(0, 8); // flags
    cdHeader.writeUInt16LE(0, 10); // compression
    cdHeader.writeUInt16LE(0, 12); // time
    cdHeader.writeUInt16LE(0, 14); // date
    cdHeader.writeUInt32LE(crc, 16);
    cdHeader.writeUInt32LE(size, 20);
    cdHeader.writeUInt32LE(size, 24);
    cdHeader.writeUInt16LE(nameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30); // extra length
    cdHeader.writeUInt16LE(0, 32); // comment length
    cdHeader.writeUInt16LE(0, 34); // disk number start
    cdHeader.writeUInt16LE(0, 36); // internal file attributes
    cdHeader.writeUInt32LE(0, 38); // external file attributes
    cdHeader.writeUInt32LE(offset, 42); // relative offset of local header
    nameBuf.copy(cdHeader, 46);

    centralDirectoryHeaders.push(cdHeader);
    offset += localHeader.length + content.length;
  }

  const cdBuffer = Buffer.concat(centralDirectoryHeaders);
  const cdOffset = offset;
  const cdSize = cdBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localFileHeaders, cdBuffer, eocd]);
}

function crc32(buf: Buffer): number {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc >>> 0;
}

function sha1(buf: Buffer): string {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const clientName = searchParams.get("name") || "Cliente VIP";
  const businessName = searchParams.get("business") || "AgendatePY Studio";
  const points = searchParams.get("points") || "4";
  const threshold = searchParams.get("threshold") || "5";
  const reward = searchParams.get("reward") || "50% OFF en próximo servicio";

  // pass.json definition compliant with Apple Wallet StoreCard specs
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.agendatepy.club",
    serialNumber: `VIP-${clientId || "1001"}`,
    teamIdentifier: "AGENDATEPY",
    organizationName: businessName,
    description: `Tarjeta VIP de Fidelidad - ${businessName}`,
    logoText: businessName,
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(15, 23, 42)",
    labelColor: "rgb(251, 191, 36)",
    storeCard: {
      primaryFields: [
        {
          key: "stamps",
          label: "SELLOS VIP",
          value: `${points} de ${threshold} ★`,
        },
      ],
      secondaryFields: [
        {
          key: "client",
          label: "TITULAR",
          value: clientName,
        },
      ],
      auxiliaryFields: [
        {
          key: "reward",
          label: "PREMIO DEL CLUB",
          value: reward,
        },
      ],
      backFields: [
        {
          key: "terms",
          label: "TÉRMINOS Y CONDICIONES",
          value: "Tarjeta válida en locales adheridos. Presentá este pase al pagar para acreditar sellos automáticos. Más info en https://agendate.py",
        },
        {
          key: "support",
          label: "ATENCIÓN POR WHATSAPP",
          value: "Soporte oficial AgendatePY Paraguay",
        },
      ],
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: `AGENDATE-VIP:${clientId}:${clientName}`,
        messageEncoding: "iso-8859-1",
        altText: `Socio VIP #${clientId}`,
      },
    ],
  };

  const passBuffer = Buffer.from(JSON.stringify(passJson, null, 2), "utf-8");

  // Manifest mapping required for Apple Wallet passes
  const manifest = {
    "pass.json": sha1(passBuffer),
    "icon.png": sha1(MINIMAL_PNG),
    "icon@2x.png": sha1(MINIMAL_PNG),
    "logo.png": sha1(MINIMAL_PNG),
  };
  const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), "utf-8");

  // Build pkpass zip archive with full assets
  const pkpassZip = createSimpleZip([
    { name: "pass.json", content: passBuffer },
    { name: "manifest.json", content: manifestBuffer },
    { name: "icon.png", content: MINIMAL_PNG },
    { name: "icon@2x.png", content: MINIMAL_PNG },
    { name: "logo.png", content: MINIMAL_PNG },
  ]);

  return new NextResponse(new Uint8Array(pkpassZip), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="tarjeta-vip-${clientId}.pkpass"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
