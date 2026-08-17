import { z } from "zod";

export const userRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "EMPLEADO"]);

export const createUserSchema = z.object({
  username: z.string().trim().min(1, "El usuario es obligatorio").max(50),
  full_name: z.string().trim().min(1, "El nombre completo es obligatorio").max(120),
  dni: z.string().trim().min(1, "El DNI es obligatorio").max(20),
  email: z.string().trim().email("Email inválido"),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  username: z.string().trim().min(1).max(50).optional(),
  full_name: z.string().trim().min(1).max(120).optional(),
  dni: z.string().trim().min(1).max(20).optional(),
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
});
