import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FindManyOptions } from "typeorm";
import { QueryParserPipe } from "@/src/common/pipes";
import { CreateSemesterDto } from "./dtos/create-semester.dto";
import { UpdateSemesterDto } from "./dtos/update-semester.dto";
import { Semester } from "./entities/semester.entity";
import { SemesterService } from "./semester.service";

@ApiTags("Semester")
@Controller("semesters")
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get()
  @ApiOperation({ summary: "Get all semesters" })
  @ApiOkResponse({ type: [Semester] })
  async getAllSemesters(
    @Query(new QueryParserPipe("MANY", ["semesterName"]))
    findOption: FindManyOptions<Semester>,
  ) {
    return this.semesterService.findAll(findOption);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get semester details by ID" })
  @ApiOkResponse({ type: Semester })
  @ApiNotFoundResponse({ description: "Semester not found" })
  async getSemester(@Param("id", ParseUUIDPipe) id: string) {
    return this.semesterService.findOne(id, true);
  }

  @Post()
  @ApiOperation({ summary: "Create a new semester" })
  @ApiOkResponse({ type: Semester })
  async createSemester(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semesterService.create(createSemesterDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update semester details" })
  @ApiOkResponse({ type: Semester })
  @ApiNotFoundResponse({ description: "Semester not found" })
  async updateSemester(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a semester" })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @ApiNotFoundResponse({ description: "Semester not found" })
  async deleteSemester(@Param("id", ParseUUIDPipe) id: string) {
    return this.semesterService.remove(id);
  }
}
