import { createZodDto } from "nestjs-zod";
import { semesterBaseSchema } from "./create-semester.dto";

export class UpdateSemesterDto extends createZodDto(
  semesterBaseSchema.partial(),
) {}
