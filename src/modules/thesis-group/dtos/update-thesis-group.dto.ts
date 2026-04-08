import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { createThesisGroupSchema } from "./create-thesis-group.dto";

export const updateThesisGroupSchema = createThesisGroupSchema
  .partial()
  .refine(
    (data) => {
      if (!data.students || data.numberOfStudents === undefined) {
        return true;
      }
      return data.students.length === data.numberOfStudents;
    },
    {
      message: "Number of students must match the student list",
      path: ["numberOfStudents"],
    },
  )
  .refine(
    (data) => {
      if (data.acceptTerms === undefined) {
        return true;
      }
      return data.acceptTerms === true;
    },
    {
      message: "You must accept the terms",
      path: ["acceptTerms"],
    },
  );

export class UpdateThesisGroupDto extends createZodDto(
  updateThesisGroupSchema,
) {}

export type UpdateThesisGroupInput = z.infer<typeof updateThesisGroupSchema>;
