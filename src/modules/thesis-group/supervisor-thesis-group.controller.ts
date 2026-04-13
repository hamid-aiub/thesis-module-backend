import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FindManyOptions } from "typeorm";
import { QueryParserPipe } from "@/src/common/pipes";
import {
  CreateThesisGroupDto,
  createThesisGroupSchema,
} from "./dtos/create-thesis-group.dto";
import {
  UpdateThesisGroupDto,
  updateThesisGroupSchema,
} from "./dtos/update-thesis-group.dto";
import { ThesisGroup } from "./entities/thesis-group.entity";
import { ThesisGroupService } from "./thesis-group.service";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";

type UploadedFieldMap = {
  literatureReview?: Express.Multer.File[];
  projectProposal?: Express.Multer.File[];
  progressReport?: Express.Multer.File[];
  finalThesisBook?: Express.Multer.File[];
  plagiarismReport?: Express.Multer.File[];
  aiDetectionReport?: Express.Multer.File[];
  presentationSlide?: Express.Multer.File[];
  poster?: Express.Multer.File[];
};

const DOCUMENT_TYPES = new Set([
  "literature_review",
  "project_proposal",
  "progress_report",
  "final_thesis_book",
  "plagiarism_report",
  "ai_detection_report",
  "presentation_slide",
  "poster",
]);

const uploadDir = join(process.cwd(), "uploads", "thesis-groups");

const uploadStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${stamp}${extname(file.originalname)}`);
  },
});

const APPROVAL_REQUEST_TYPES = new Set([
  "additional_groups",
  "extension",
  "other",
]);

@ApiTags("Supervisor")
@Controller("supervisor")
export class SupervisorThesisGroupController {
  constructor(private readonly thesisGroupService: ThesisGroupService) {}

  @Get("dashboard")
  @ApiOperation({
    summary: "Get supervisor dashboard stats, semester summary and activities",
  })
  @ApiQuery({ name: "supervisorId", required: false, type: String })
  @ApiQuery({ name: "semesterId", required: false, type: String })
  async getSupervisorDashboard(
    @Query("supervisorId") supervisorId?: string,
    @Query("semesterId") semesterId?: string,
  ) {
    return this.thesisGroupService.getSupervisorDashboard({
      supervisorId,
      semesterId,
    });
  }

  @Get("approval-requests")
  @ApiOperation({ summary: "Get supervisor approval requests" })
  @ApiQuery({ name: "supervisorId", required: false, type: String })
  @ApiQuery({ name: "semesterId", required: false, type: String })
  async getSupervisorApprovalRequests(
    @Query("supervisorId") supervisorId?: string,
    @Query("semesterId") semesterId?: string,
  ) {
    return this.thesisGroupService.getSupervisorApprovalRequests({
      supervisorId,
      semesterId,
    });
  }

  @Post("approval-requests")
  @UseInterceptors(
    FilesInterceptor("attachments", 5, {
      storage: uploadStorage,
    }),
  )
  @ApiOperation({ summary: "Create a supervisor approval request" })
  async createSupervisorApprovalRequest(
    @Body() body: Record<string, unknown>,
    @UploadedFiles() attachments: Express.Multer.File[] = [],
  ) {
    const supervisorId =
      typeof body.supervisorId === "string" ? body.supervisorId.trim() : "";
    const semesterId =
      typeof body.semesterId === "string" && body.semesterId.trim()
        ? body.semesterId
        : undefined;
    const type =
      typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message : "";
    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const groupCount =
      body.groupCount !== undefined && body.groupCount !== ""
        ? Number(body.groupCount)
        : undefined;

    if (!supervisorId) {
      throw new BadRequestException("supervisorId is required");
    }

    if (!message.trim()) {
      throw new BadRequestException("message is required");
    }

    if (
      groupCount !== undefined &&
      (!Number.isInteger(groupCount) || groupCount < 0)
    ) {
      throw new BadRequestException("groupCount must be a valid number");
    }

    if (type && !APPROVAL_REQUEST_TYPES.has(type)) {
      throw new BadRequestException("Unsupported request type");
    }

    return this.thesisGroupService.createSupervisorApprovalRequest({
      supervisorId,
      semesterId,
      type: (type || "additional_groups") as
        | "additional_groups"
        | "extension"
        | "other",
      message,
      reason,
      groupCount,
      attachments: attachments.map(
        (file) => `/uploads/thesis-groups/${file.filename}`,
      ),
    });
  }

  @Get("groups")
  @ApiOperation({ summary: "Get supervisor thesis groups" })
  @ApiOkResponse({ type: [ThesisGroup] })
  @ApiQuery({ name: "supervisorId", required: false, type: String })
  @ApiQuery({ name: "semesterId", required: false, type: String })
  async getSupervisorGroups(
    @Query(
      new QueryParserPipe("MANY", [
        "semesterId",
        "supervisorId",
        "supervisorName",
        "supervisorEmail",
        "proposedTitle",
        "thesisDomain",
      ]),
    )
    findOption: FindManyOptions<ThesisGroup>,
    @Query("supervisorId") supervisorId?: string,
    @Query("semesterId") semesterId?: string,
  ) {
    if (supervisorId) {
      findOption.where = {
        ...(typeof findOption.where === "object" &&
        !Array.isArray(findOption.where)
          ? findOption.where
          : {}),
        supervisorId,
      };
    }

    if (semesterId) {
      findOption.where = {
        ...(typeof findOption.where === "object" &&
        !Array.isArray(findOption.where)
          ? findOption.where
          : {}),
        semesterId,
      };
    }

    return this.thesisGroupService.findAll(findOption);
  }

  @Post("create-group")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "literatureReview", maxCount: 1 },
        { name: "projectProposal", maxCount: 1 },
      ],
      { storage: uploadStorage },
    ),
  )
  @ApiOperation({ summary: "Create thesis group from supervisor route" })
  @ApiOkResponse({ type: ThesisGroup })
  async createSupervisorGroup(
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: UploadedFieldMap,
  ) {
    const createDto = this.parseCreateBody(body, files);
    return this.thesisGroupService.create(createDto);
  }

  @Patch("groups/:id")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "literatureReview", maxCount: 1 },
        { name: "projectProposal", maxCount: 1 },
      ],
      { storage: uploadStorage },
    ),
  )
  @ApiOperation({ summary: "Update thesis group from supervisor route" })
  @ApiOkResponse({ type: ThesisGroup })
  async updateSupervisorGroup(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: UploadedFieldMap,
  ) {
    const updateDto = this.parseUpdateBody(body, files);
    return this.thesisGroupService.update(id, updateDto);
  }

  @Get("groups/:id/documents")
  @ApiOperation({ summary: "Get all documents for a thesis group" })
  async getSupervisorGroupDocuments(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("semesterId") semesterId?: string,
  ) {
    return this.thesisGroupService.getGroupDocuments(id, semesterId);
  }

  @Delete("groups/:id/documents/:documentType")
  @ApiOperation({ summary: "Delete a document for a thesis group" })
  async deleteSupervisorGroupDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentType") documentType: string,
    @Query("semesterId") semesterId?: string,
  ) {
    const normalizedType = documentType.trim().toLowerCase();
    if (!DOCUMENT_TYPES.has(normalizedType)) {
      throw new BadRequestException("Unsupported document type");
    }

    return this.thesisGroupService.removeGroupDocument(
      id,
      normalizedType,
      semesterId,
    );
  }

  @Post("groups/:id/evidences")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "progressReport", maxCount: 1 },
        { name: "finalThesisBook", maxCount: 1 },
        { name: "plagiarismReport", maxCount: 1 },
        { name: "aiDetectionReport", maxCount: 1 },
        { name: "presentationSlide", maxCount: 1 },
        { name: "poster", maxCount: 1 },
      ],
      { storage: uploadStorage },
    ),
  )
  @ApiOperation({ summary: "Upload evidence documents for a thesis group" })
  async uploadEvidenceForGroup(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: UploadedFieldMap,
  ) {
    const payload = this.parseEvidenceBody(body, files);
    return this.thesisGroupService.uploadEvidence(id, payload);
  }

  private parseCreateBody(
    body: Record<string, unknown>,
    files: UploadedFieldMap,
  ): CreateThesisGroupDto {
    const payload = this.normalizePayload(body, files);
    const parsed = createThesisGroupSchema.safeParse(payload);

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? "Invalid payload",
      );
    }

    return parsed.data as CreateThesisGroupDto;
  }

  private parseUpdateBody(
    body: Record<string, unknown>,
    files: UploadedFieldMap,
  ): UpdateThesisGroupDto {
    const payload = this.normalizePayload(body, files, true);
    const parsed = updateThesisGroupSchema.safeParse(payload);

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? "Invalid payload",
      );
    }

    return parsed.data as UpdateThesisGroupDto;
  }

  private normalizePayload(
    body: Record<string, unknown>,
    files: UploadedFieldMap,
    isPartial = false,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = { ...body };

    if (typeof body.students === "string") {
      try {
        payload.students = JSON.parse(body.students);
      } catch {
        throw new BadRequestException("Invalid students payload");
      }
    }

    if (body.numberOfStudents !== undefined) {
      payload.numberOfStudents = Number(body.numberOfStudents);
    }

    if (body.acceptTerms !== undefined) {
      payload.acceptTerms =
        body.acceptTerms === true ||
        body.acceptTerms === "true" ||
        body.acceptTerms === "1";
    }

    const literatureReviewFile = files?.literatureReview?.[0];
    const projectProposalFile = files?.projectProposal?.[0];

    if (literatureReviewFile) {
      payload.literatureReview = `/uploads/thesis-groups/${literatureReviewFile.filename}`;
    } else if (!isPartial && body.literatureReview === "") {
      payload.literatureReview = undefined;
    }

    if (projectProposalFile) {
      payload.projectProposal = `/uploads/thesis-groups/${projectProposalFile.filename}`;
    } else if (!isPartial && body.projectProposal === "") {
      payload.projectProposal = undefined;
    }

    return payload;
  }

  private parseEvidenceBody(
    body: Record<string, unknown>,
    files: UploadedFieldMap,
  ): {
    semesterId?: string;
    plagiarismPercentage?: number;
    aiDetectionPercentage?: number;
    progressReport?: string;
    finalThesisBook?: string;
    plagiarismReport?: string;
    aiDetectionReport?: string;
    presentationSlide?: string;
    poster?: string;
  } {
    const toFilePath = (file?: Express.Multer.File) =>
      file ? `/uploads/thesis-groups/${file.filename}` : undefined;

    const semesterId =
      typeof body.semesterId === "string" && body.semesterId.trim()
        ? body.semesterId
        : undefined;

    const plagiarismPercentage =
      body.plagiarismPercentage !== undefined &&
      body.plagiarismPercentage !== ""
        ? Number(body.plagiarismPercentage)
        : undefined;
    const aiDetectionPercentage =
      body.aiDetectionPercentage !== undefined &&
      body.aiDetectionPercentage !== ""
        ? Number(body.aiDetectionPercentage)
        : undefined;

    if (
      plagiarismPercentage !== undefined &&
      (Number.isNaN(plagiarismPercentage) ||
        plagiarismPercentage < 0 ||
        plagiarismPercentage > 19)
    ) {
      throw new BadRequestException(
        "Plagiarism percentage must be between 0 and 19",
      );
    }

    if (
      aiDetectionPercentage !== undefined &&
      (Number.isNaN(aiDetectionPercentage) ||
        aiDetectionPercentage < 0 ||
        aiDetectionPercentage > 15)
    ) {
      throw new BadRequestException(
        "AI detection percentage must be between 0 and 15",
      );
    }

    return {
      semesterId,
      plagiarismPercentage,
      aiDetectionPercentage,
      progressReport: toFilePath(files.progressReport?.[0]),
      finalThesisBook: toFilePath(files.finalThesisBook?.[0]),
      plagiarismReport: toFilePath(files.plagiarismReport?.[0]),
      aiDetectionReport: toFilePath(files.aiDetectionReport?.[0]),
      presentationSlide: toFilePath(files.presentationSlide?.[0]),
      poster: toFilePath(files.poster?.[0]),
    };
  }
}
