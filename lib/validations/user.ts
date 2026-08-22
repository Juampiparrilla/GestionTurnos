import { z } from "zod";

export const userRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "EMPLEADO"]);

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "El nombre completo es obligatorio")
  .max(80, "El nombre no puede superar los 80 caracteres")
  .regex(/^[\p{L}\s'-]+$/u, "El nombre solo puede tener letras, espacios, apóstrofes y guiones");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "El usuario debe tener al menos 3 caracteres")
  .max(30, "El usuario no puede superar los 30 caracteres")
  .regex(/^[a-zA-Z0-9._-]+$/, "El usuario solo puede tener letras, números, puntos, guiones y guiones bajos");

export const dniSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, "El DNI debe tener exactamente 8 números, sin puntos ni espacios");

export const emailSchema = z.string().trim().max(150, "El email es demasiado largo").email("Email inválido");

export const createUserSchema = z.object({
  username: usernameSchema,
  full_name: fullNameSchema,
  dni: dniSchema,
  email: emailSchema,
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  full_name: fullNameSchema.optional(),
  dni: dniSchema.optional(),
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
});
