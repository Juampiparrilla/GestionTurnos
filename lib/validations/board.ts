import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede superar los 100 caracteres");

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "La descripción no puede superar los 500 caracteres")
  .optional()
  .or(z.literal(""));

export const createBoardSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateBoardSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  active: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid("Usuario inválido"),
});
