import { z } from "zod";

export const setSundaySchema = z.object({
  sundayDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elegí una fecha."),
  userId: z.string().uuid({ message: "Elegí a la persona para asignar." }),
});
