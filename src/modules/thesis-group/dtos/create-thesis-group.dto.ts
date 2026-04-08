import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Student name is required"),
  cgpa: z
    .string()
    .min(1, "CGPA is required")
    .regex(/^\d+\.?\d*$/, "Invalid CGPA format"),
  primaryEmail: z
    .string()
    .min(1, "Primary email is required")
    .email("Invalid email address")
    .regex(/@student\.aiub\.edu$/, "Email must end with @student.aiub.edu"),
  secondaryEmail: z.string().email("Invalid email address").optional(),
  phoneNo: z.string().min(1, "Phone number is required"),
  creditCompleted: z.string().min(1, "Credit completed is required"),
  creditTakeWithThesis: z.string().optional(),
  researchMethodologyCompleted: z.enum(["yes", "no"]).default("no"),
});

const thesisGroupBaseSchema = z.object({
  semesterId: z.string().uuid("Invalid semester ID"),
  classId: z.string().min(1, "Class ID cannot be empty").optional(),
  globalGroupSerial: z
    .string()
    .min(1, "Global group serial cannot be empty")
    .optional(),
  supervisorGroup: z
    .string()
    .min(1, "Supervisor group cannot be empty")
    .optional(),
  externalId: z.string().min(1, "External ID cannot be empty").optional(),
  externalName: z.string().min(1, "External name cannot be empty").optional(),
  thesisManagementTeamRemark: z
    .string()
    .min(1, "Thesis management team remark cannot be empty")
    .optional(),
  supervisorRemark: z
    .string()
    .min(1, "Supervisor remark cannot be empty")
    .optional(),
  supervisorId: z.string().min(1, "Supervisor ID is required"),
  supervisorName: z.string().min(1, "Supervisor name is required"),
  supervisorEmail: z.string().email("Invalid supervisor email"),
  proposedTitle: z.string().min(5, "Title must be at least 5 characters"),
  thesisDomain: z.string().min(1, "Thesis domain is required"),
  shortDescription: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  literatureReview: z.string().optional(),
  projectProposal: z.string().optional(),
  numberOfStudents: z.number().int().min(2).max(4),
  students: z
    .array(studentSchema)
    .min(2, "Minimum 2 students required")
    .max(4, "Maximum 4 students allowed"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms"),
});

export const createThesisGroupSchema = thesisGroupBaseSchema.refine(
  (data) => data.students.length === data.numberOfStudents,
  {
    message: "Number of students must match the student list",
    path: ["numberOfStudents"],
  },
);

export class CreateThesisGroupDto extends createZodDto(
  createThesisGroupSchema,
) {}

export type CreateThesisGroupInput = z.infer<typeof createThesisGroupSchema>;
