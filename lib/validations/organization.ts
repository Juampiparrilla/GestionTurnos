import { z } from "zod";
import { dniSchema, emailSchema, fullNameSchema, usernameSchema } from "./user";

const orgNameSchema = z
  .string()
  .trim()
  .min(2, "El nombre de la organización es obligatorio")
  .max(100, "El nombre no puede superar los 100 caracteres");

export const createOrganizationSchema = z.object({
  orgName: orgNameSchema,
  fullName: fullNameSchema,
  username: usernameSchema,
  dni: dniSchema,
  email: emailSchema,
});

export const updateOrganizationSchema = z.object({
  name: orgNameSchema,
  phone: z
    .string()
    .trim()
    .max(30, "No puede superar los 30 caracteres")
    .optional()
    .or(z.literal("")),
});
