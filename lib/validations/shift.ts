import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)");

const nameSchema = z
  .string()
  .trim()
  .max(50, "El nombre no puede superar los 50 caracteres")
  .optional()
  .or(z.literal(""));

export const createShiftSchema = z
  .object({
    name: nameSchema,
    start_time: timeSchema,
    end_time: timeSchema,
  })
  .refine((data) => data.start_time < data.end_time, {
    message:
      "La hora de inicio debe ser anterior a la de fin (los turnos no pueden cruzar la medianoche)",
    path: ["end_time"],
  });

export const updateShiftSchema = z
  .object({
    name: nameSchema,
    start_time: timeSchema.optional(),
    end_time: timeSchema.optional(),
    active: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
      }
      return true;
    },
    {
      message:
        "La hora de inicio debe ser anterior a la de fin (los turnos no pueden cruzar la medianoche)",
      path: ["end_time"],
    },
  );
