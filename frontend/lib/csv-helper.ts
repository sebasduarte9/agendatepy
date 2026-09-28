/**
 * Helper para generación de archivos CSV compatibles con Microsoft Excel y RFC 4180.
 * Incluye UTF-8 Byte Order Mark (BOM) para renderizado correcto de tildes, eñes y caracteres especiales.
 */

export function formatCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  // Si contiene comas, comillas dobles, saltos de línea o punto y coma, se envuelve en comillas
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r") ||
    str.includes(";")
  ) {
    // Las comillas internas se escapan como comillas dobles (" -> "")
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const BOM = "\uFEFF"; // Byte Order Mark para compatibilidad total con Excel en español
  const headerLine = headers.map(formatCSVCell).join(",");
  const dataLines = rows.map((row) => row.map(formatCSVCell).join(","));
  return BOM + [headerLine, ...dataLines].join("\r\n");
}
