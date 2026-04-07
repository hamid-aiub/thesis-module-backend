import { createZodDto } from "nestjs-zod";
import z from "zod";

export class UpdateUserDto extends createZodDto(
  z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }),
) {}
