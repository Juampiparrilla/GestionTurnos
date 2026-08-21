import { INVITATION_EXPIRATION_HOURS, PASSWORD_RESET_EXPIRATION_HOURS } from "./config";

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

export function buildPasswordResetMessage(fullName: string, url: string): string {
  return [
    `Hola ${fullName} 👋`,
    "",
    "Te generaron un enlace para restablecer tu contraseña en la aplicación de gestión de turnos.",
    "",
    "Ingresá al siguiente enlace para crear una contraseña nueva:",
    url,
    "",
    `⚠️ Este enlace es personal y vence en ${PASSWORD_RESET_EXPIRATION_HOURS} horas.`,
  ].join("\n");
}

// Solo se llama desde componentes cliente (usa window). No fija un número
// de teléfono a propósito: el admin elige el contacto dentro de WhatsApp,
// así no hace falta guardar teléfonos de empleados solo para esto.
function shareViaWhatsApp(message: string): void {
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
}

export function shareInvitationViaWhatsApp(fullName: string, url: string): void {
  shareViaWhatsApp(buildInvitationMessage(fullName, url));
}

export function sharePasswordResetViaWhatsApp(fullName: string, url: string): void {
  shareViaWhatsApp(buildPasswordResetMessage(fullName, url));
}
