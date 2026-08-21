import { randomBytes, createHash } from "node:crypto";

// 256 bits de aleatoriedad, codificado para ir en una URL sin escapes.
export function generateInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

// Solo el hash se persiste; el token crudo nunca toca la base de datos.
export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
