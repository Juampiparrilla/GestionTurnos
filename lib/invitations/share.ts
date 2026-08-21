import { INVITATION_EXPIRATION_HOURS } from "./config";

export function buildInvitationUrl(origin: string, token: string): string {
  return `${origin}/invitacion/${token}`;
}

export function buildInvitationMessage(fullName: string, url: string): string {
  return [
    `Hola ${fullName} 👋`,
    "",
    "Te invitaron a utilizar la aplicación de gestión de turnos.",
    "",
    "Ingresá al siguiente enlace para activar tu cuenta y crear tu contraseña:",
    url,
    "",
    `⚠️ Este enlace es personal y vence en ${INVITATION_EXPIRATION_HOURS} horas.`,
  ].join("\n");
}

// Solo se llama desde componentes cliente (usa window). No fija un número
// de teléfono a propósito: el admin elige el contacto dentro de WhatsApp,
// así no hace falta guardar teléfonos de empleados solo para esto.
export function shareInvitationViaWhatsApp(fullName: string, url: string): void {
  const message = buildInvitationMessage(fullName, url);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
}
