// Util seguro para cookies en cliente

export type SameSiteOpt = "Lax" | "Strict" | "None";

export function setCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    expiresDays?: number;
    sameSite?: SameSiteOpt;
    secure?: boolean;
  } = {}
) {
  // Codificar el valor para evitar caracteres inválidos
  const encValue = encodeURIComponent(value);

  // Construcción sin saltos de línea, sin caracteres no válidos
  const parts: string[] = [`${name}=${encValue}`];

  parts.push(`Path=${options.path ?? "/"}`);

  if (options.expiresDays && Number.isFinite(options.expiresDays)) {
    const d = new Date();
    d.setDate(d.getDate() + options.expiresDays);
    parts.push(`Expires=${d.toUTCString()}`);
  }

  const sameSite = options.sameSite ?? "Lax";
  parts.push(`SameSite=${sameSite}`);

  // Importante: Secure solo si estamos en https
  if (options.secure) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function getCookie(name: string): string | null {
  const pair = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  if (!pair) return null;
  const raw = pair.split("=")[1] ?? "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export function deleteCookie(name: string) {
  // Borrado estándar
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}