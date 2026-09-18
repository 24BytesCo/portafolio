export function trimString(len: number, str: string) {
  if (str.length > len) {
    return str.substring(0, len).trim() + "...";
  }
  return str;
}

// "31 de julio de 2026". En UTC: las fechas del frontmatter no traen hora y en
// la zona local (UTC-5) saldrían con un día menos.
export function formatearFecha(fecha: string | Date): string {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const getYearDisplay = (startYear: number) => {
  const currentYear = new Date().getFullYear();
  if (startYear < 1900 || startYear > currentYear) {
    throw new Error("Invalid start year");
  }
  return startYear === currentYear ? startYear : `${startYear}-${currentYear}`;
};
