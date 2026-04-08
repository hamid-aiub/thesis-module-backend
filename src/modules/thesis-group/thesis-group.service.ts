import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import {
  CreateThesisGroupDto,
  CreateThesisGroupInput,
} from "./dtos/create-thesis-group.dto";
import {
  UpdateThesisGroupDto,
  UpdateThesisGroupInput,
} from "./dtos/update-thesis-group.dto";
import { ThesisGroupDocument } from "./entities/thesis-group-document.entity";
import { ThesisGroupStudent } from "./entities/thesis-group-student.entity";
import { ThesisGroup } from "./entities/thesis-group.entity";

interface GroupDocumentUpdateInput {
  literatureReview?: string;
  projectProposal?: string;
  progressReport?: string;
  finalThesisBook?: string;
  plagiarismReport?: string;
  aiDetectionReport?: string;
  presentationSlide?: string;
  poster?: string;
  plagiarismPercentage?: number;
  aiDetectionPercentage?: number;
}

@Injectable()
export class ThesisGroupService {
  constructor(
    @InjectRepository(ThesisGroup)
    private readonly thesisGroupRepository: Repository<ThesisGroup>,
    @InjectRepository(ThesisGroupStudent)
    private readonly studentRepository: Repository<ThesisGroupStudent>,
    @InjectRepository(ThesisGroupDocument)
    private readonly documentRepository: Repository<ThesisGroupDocument>,
  ) {}

  async findAll(
    findOption: FindManyOptions<ThesisGroup> = {},
  ): Promise<ThesisGroup[]> {
    try {
      findOption.relations = {
        students: true,
        semester: true,
        documents: true,
      };

      if (!findOption.order) {
        findOption.order = { createdAt: "DESC" };
      }

      return await this.thesisGroupRepository.find(findOption);
    } catch {
      throw new BadRequestException();
    }
  }

  async findOne(id: string, throwError = false): Promise<ThesisGroup | null> {
    try {
      const thesisGroup = await this.thesisGroupRepository.findOne({
        where: { id },
        relations: { students: true, semester: true, documents: true },
      });

      if (!thesisGroup && throwError) {
        throw new NotFoundException("Thesis group not found");
      }

      return thesisGroup;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException();
    }
  }

  async create(createDto: CreateThesisGroupDto): Promise<ThesisGroup> {
    try {
      this.assertValidStudentCount(createDto);
      this.assertUniqueStudents(createDto.students);

      const { literatureReview, projectProposal, ...groupPayload } = createDto;

      const [semesterGroupCount, supervisorSemesterGroupCount] =
        await Promise.all([
          this.thesisGroupRepository.count({
            where: { semesterId: createDto.semesterId },
          }),
          this.thesisGroupRepository.count({
            where: {
              semesterId: createDto.semesterId,
              supervisorId: createDto.supervisorId,
            },
          }),
        ]);

      const globalGroupSerial =
        createDto.globalGroupSerial ??
        this.formatSerial(semesterGroupCount + 1, 2);
      const supervisorGroup =
        createDto.supervisorGroup ??
        `G${this.formatSerial(supervisorSemesterGroupCount + 1, 2)}`;

      const thesisGroup = this.thesisGroupRepository.create({
        ...groupPayload,
        globalGroupSerial,
        supervisorGroup,
        students: groupPayload.students,
      });

      const createdGroup = await this.thesisGroupRepository.save(thesisGroup);

      if (literatureReview || projectProposal) {
        await this.upsertGroupDocument(
          createdGroup.id,
          createdGroup.semesterId,
          {
            literatureReview,
            projectProposal,
          },
        );
      }

      return (await this.findOne(createdGroup.id, true)) as ThesisGroup;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException();
    }
  }

  async update(
    id: string,
    updateDto: UpdateThesisGroupDto,
  ): Promise<ThesisGroup> {
    try {
      const existingGroup = await this.findOne(id, true);
      if (!existingGroup) {
        throw new NotFoundException("Thesis group not found");
      }

      const mergedData = {
        ...existingGroup,
        ...updateDto,
        students: updateDto.students ?? existingGroup.students,
      } as UpdateThesisGroupInput & CreateThesisGroupInput;

      this.assertValidStudentCount({
        numberOfStudents:
          mergedData.numberOfStudents ?? mergedData.students.length,
        students: mergedData.students,
      });
      this.assertUniqueStudents(mergedData.students);

      const { students, literatureReview, projectProposal, ...rest } =
        updateDto;
      await this.thesisGroupRepository.save({
        ...existingGroup,
        ...rest,
      });

      const updateDocuments: GroupDocumentUpdateInput = {};
      if (literatureReview) {
        updateDocuments.literatureReview = literatureReview;
      }

      if (projectProposal) {
        updateDocuments.projectProposal = projectProposal;
      }

      if (Object.keys(updateDocuments).length > 0) {
        await this.upsertGroupDocument(
          id,
          (updateDto.semesterId ?? existingGroup.semesterId) as string,
          updateDocuments,
        );
      }

      if (students) {
        await this.studentRepository.delete({ thesisGroupId: id });
        await this.studentRepository.save(
          students.map((student) =>
            this.studentRepository.create({
              ...student,
              thesisGroupId: id,
            }),
          ),
        );
      }

      const updatedGroup = await this.findOne(id, true);
      if (!updatedGroup) {
        throw new NotFoundException("Thesis group not found");
      }

      return updatedGroup;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new BadRequestException();
    }
  }

  async remove(id: string): Promise<{ deleted: true }> {
    try {
      await this.findOne(id, true);
      await this.thesisGroupRepository.delete(id);
      return { deleted: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException();
    }
  }

  async uploadEvidence(
    groupId: string,
    payload: {
      semesterId?: string;
      plagiarismPercentage?: number;
      aiDetectionPercentage?: number;
      progressReport?: string;
      finalThesisBook?: string;
      plagiarismReport?: string;
      aiDetectionReport?: string;
      presentationSlide?: string;
      poster?: string;
    },
  ): Promise<ThesisGroupDocument> {
    const group = await this.findOne(groupId, true);
    if (!group) {
      throw new NotFoundException("Thesis group not found");
    }

    const semesterId = payload.semesterId ?? group.semesterId;
    const evidenceUpdate: GroupDocumentUpdateInput = {
      progressReport: payload.progressReport,
      finalThesisBook: payload.finalThesisBook,
      plagiarismReport: payload.plagiarismReport,
      aiDetectionReport: payload.aiDetectionReport,
      presentationSlide: payload.presentationSlide,
      poster: payload.poster,
      plagiarismPercentage: payload.plagiarismPercentage,
      aiDetectionPercentage: payload.aiDetectionPercentage,
    };

    const hasAnyUpdate = Object.values(evidenceUpdate).some(
      (value) => value !== undefined,
    );

    if (!hasAnyUpdate) {
      throw new BadRequestException("No evidence payload was provided");
    }

    return this.upsertGroupDocument(groupId, semesterId, evidenceUpdate);
  }

  async getGroupDocuments(
    groupId: string,
    semesterId?: string,
  ): Promise<ThesisGroupDocument | null> {
    const group = await this.findOne(groupId, true);
    if (!group) {
      throw new NotFoundException("Thesis group not found");
    }

    return this.documentRepository.findOne({
      where: {
        thesisGroupId: groupId,
        semesterId: semesterId ?? group.semesterId,
      },
    });
  }

  async removeGroupDocument(
    groupId: string,
    documentType: string,
    semesterId?: string,
  ): Promise<{ deleted: true }> {
    const group = await this.findOne(groupId, true);
    if (!group) {
      throw new NotFoundException("Thesis group not found");
    }

    const activeSemesterId = semesterId ?? group.semesterId;
    const targetDocument = await this.documentRepository.findOne({
      where: {
        thesisGroupId: groupId,
        semesterId: activeSemesterId,
      },
    });

    if (!targetDocument) {
      throw new NotFoundException("Document not found for this group");
    }

    const clearMap: Record<string, Partial<ThesisGroupDocument>> = {
      literature_review: { literatureReview: null },
      project_proposal: { projectProposal: null },
      progress_report: { progressReport: null },
      final_thesis_book: { finalThesisBook: null },
      plagiarism_report: {
        plagiarismReport: null,
        plagiarismPercentage: null,
      },
      ai_detection_report: {
        aiDetectionReport: null,
        aiDetectionPercentage: null,
      },
      presentation_slide: { presentationSlide: null },
      poster: { poster: null },
    };

    const clearPayload = clearMap[documentType];
    if (!clearPayload) {
      throw new BadRequestException("Unsupported document type");
    }

    await this.documentRepository.save({
      ...targetDocument,
      ...clearPayload,
    });

    return { deleted: true };
  }

  private assertValidStudentCount(data: {
    numberOfStudents: number;
    students: Array<{ studentId: string }>;
  }): void {
    const count = data.numberOfStudents;

    if (count < 2 || count > 4) {
      throw new BadRequestException(
        "Number of students must be between 2 and 4",
      );
    }

    if (!data.students || data.students.length !== count) {
      throw new BadRequestException(
        "Number of students must match the student list",
      );
    }
  }

  private assertUniqueStudents(
    students: Array<{ studentId: string; primaryEmail: string }>,
  ): void {
    const studentIds = new Set<string>();
    const primaryEmails = new Set<string>();

    for (const student of students) {
      if (studentIds.has(student.studentId)) {
        throw new BadRequestException(
          "Duplicate student ID found in the group",
        );
      }

      const normalizedEmail = student.primaryEmail.toLowerCase();
      if (primaryEmails.has(normalizedEmail)) {
        throw new BadRequestException(
          "Duplicate primary email found in the group",
        );
      }

      studentIds.add(student.studentId);
      primaryEmails.add(normalizedEmail);
    }
  }

  private formatSerial(value: number, minDigits: number): string {
    return value.toString().padStart(minDigits, "0");
  }

  private async upsertGroupDocument(
    thesisGroupId: string,
    semesterId: string,
    updates: GroupDocumentUpdateInput,
  ): Promise<ThesisGroupDocument> {
    const existing = await this.documentRepository.findOne({
      where: { thesisGroupId },
    });

    const entity = this.documentRepository.create({
      ...(existing ?? {}),
      thesisGroupId,
      semesterId,
      ...updates,
    });

    return this.documentRepository.save(entity);
  }
}
