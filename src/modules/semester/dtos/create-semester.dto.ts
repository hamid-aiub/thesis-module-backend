import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const semesterBaseSchema = z.object({
  semesterName: z.string().min(1, "Semester name is required"),
  groupCreationStart: z.string().min(1, "Start date is required"),
  groupCreationEnd: z.string().min(1, "End date is required"),
  midEvidenceStart: z.string().min(1, "Start date is required"),
  midEvidenceEnd: z.string().min(1, "End date is required"),
  finalEvidenceStart: z.string().min(1, "Start date is required"),
  finalEvidenceEnd: z.string().min(1, "End date is required"),
});

export const createSemesterSchema = semesterBaseSchema
  .refine((data) => data.groupCreationStart <= data.groupCreationEnd, {
    message: "Group creation end date must be on or after the start date",
    path: ["groupCreationEnd"],
  })
  .refine((data) => data.midEvidenceStart <= data.midEvidenceEnd, {
    message: "Mid evidence end date must be on or after the start date",
    path: ["midEvidenceEnd"],
  })
  .refine((data) => data.finalEvidenceStart <= data.finalEvidenceEnd, {
    message: "Final evidence end date must be on or after the start date",
    path: ["finalEvidenceEnd"],
  });

export class CreateSemesterDto extends createZodDto(createSemesterSchema) {}

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
