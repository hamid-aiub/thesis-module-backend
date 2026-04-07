import { Role } from "@/src/common/enums/role.enum";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class UpdateRoleDto extends createZodDto(
  z.object({
    role: z.enum(Object.values(Role)),
  }),
) {}
