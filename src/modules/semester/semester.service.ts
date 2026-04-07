import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import {
  CreateSemesterDto,
  CreateSemesterInput,
} from "./dtos/create-semester.dto";
import { UpdateSemesterDto } from "./dtos/update-semester.dto";
import { Semester } from "./entities/semester.entity";

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  async findAll(
    findOption: FindManyOptions<Semester> = {},
  ): Promise<Semester[]> {
    try {
      if (!findOption.order) {
        findOption.order = { createdAt: "ASC" };
      }

      return await this.semesterRepository.find(findOption);
    } catch {
      throw new BadRequestException();
    }
  }

  async findOne(id: string, throwError = false): Promise<Semester | null> {
    try {
      const semester = await this.semesterRepository.findOne({
        where: { id },
      });

      if (!semester && throwError) {
        throw new NotFoundException("Semester not found");
      }

      return semester;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException();
    }
  }

  async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    try {
      await this.assertUniqueSemesterName(createSemesterDto.semesterName);
      this.assertValidDateRanges(createSemesterDto);

      const semester = this.semesterRepository.create(createSemesterDto);
      return await this.semesterRepository.save(semester);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException();
    }
  }

  async update(
    id: string,
    updateSemesterDto: UpdateSemesterDto,
  ): Promise<Semester> {
    try {
      const existingSemester = await this.findOne(id, true);
      if (!existingSemester) {
        throw new NotFoundException("Semester not found");
      }
      const mergedSemester = {
        ...existingSemester,
        ...updateSemesterDto,
      } as CreateSemesterInput;

      if (
        updateSemesterDto.semesterName &&
        updateSemesterDto.semesterName !== existingSemester.semesterName
      ) {
        await this.assertUniqueSemesterName(updateSemesterDto.semesterName, id);
      }

      this.assertValidDateRanges(mergedSemester);

      return await this.semesterRepository.save({
        ...existingSemester,
        ...updateSemesterDto,
      });
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new BadRequestException();
    }
  }

  async remove(id: string): Promise<{ deleted: true }> {
    try {
      await this.findOne(id, true);
      await this.semesterRepository.delete(id);
      return { deleted: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException();
    }
  }

  private async assertUniqueSemesterName(
    semesterName: string,
    ignoreId?: string,
  ): Promise<void> {
    const existingSemester = await this.semesterRepository.findOne({
      where: { semesterName },
    });

    if (existingSemester && existingSemester.id !== ignoreId) {
      throw new BadRequestException("Semester name already exists");
    }
  }

  private assertValidDateRanges(data: CreateSemesterInput): void {
    const datePairs: Array<[string, string, string]> = [
      [
        data.groupCreationStart,
        data.groupCreationEnd,
        "Group creation end date must be on or after the start date",
      ],
      [
        data.midEvidenceStart,
        data.midEvidenceEnd,
        "Mid evidence end date must be on or after the start date",
      ],
      [
        data.finalEvidenceStart,
        data.finalEvidenceEnd,
        "Final evidence end date must be on or after the start date",
      ],
    ];

    for (const [startDate, endDate, message] of datePairs) {
      if (!startDate || !endDate) {
        throw new BadRequestException("Semester dates are required");
      }

      if (startDate > endDate) {
        throw new BadRequestException(message);
      }
    }
  }
}
