import { z } from "zod";

export const setAssignmentSchema = z
  .object({
    shiftConfigurationId: z.string().uuid(),
    dayOfWeek: z.number().int().min(0).max(6),
    status: z.enum(["EMPLEADO", "FERIADO", "CERRADO"]),
    userId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => (data.status === "EMPLEADO" ? !!data.userId : true), {
    message: "Elegí a la persona para asignar.",
    path: ["userId"],
  });
