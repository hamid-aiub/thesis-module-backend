import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FindManyOptions } from "typeorm";
import { QueryParserPipe } from "@/src/common/pipes";
import { CreateThesisGroupDto } from "./dtos/create-thesis-group.dto";
import { UpdateThesisGroupDto } from "./dtos/update-thesis-group.dto";
import { ThesisGroup } from "./entities/thesis-group.entity";
import { ThesisGroupService } from "./thesis-group.service";

@ApiTags("Thesis Group")
@Controller("thesis-groups")
export class ThesisGroupController {
  constructor(private readonly thesisGroupService: ThesisGroupService) {}

  @Get()
  @ApiOperation({ summary: "Get all thesis groups" })
  @ApiOkResponse({ type: [ThesisGroup] })
  async getAllThesisGroups(
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
  ) {
    return this.thesisGroupService.findAll(findOption);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get thesis group by ID" })
  @ApiOkResponse({ type: ThesisGroup })
  @ApiNotFoundResponse({ description: "Thesis group not found" })
  async getThesisGroup(@Param("id", ParseUUIDPipe) id: string) {
    return this.thesisGroupService.findOne(id, true);
  }

  @Post()
  @ApiOperation({ summary: "Create a thesis group" })
  @ApiOkResponse({ type: ThesisGroup })
  async createThesisGroup(@Body() createDto: CreateThesisGroupDto) {
    return this.thesisGroupService.create(createDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update thesis group" })
  @ApiOkResponse({ type: ThesisGroup })
  @ApiNotFoundResponse({ description: "Thesis group not found" })
  async updateThesisGroup(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateThesisGroupDto,
  ) {
    return this.thesisGroupService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete thesis group" })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @ApiNotFoundResponse({ description: "Thesis group not found" })
  async deleteThesisGroup(@Param("id", ParseUUIDPipe) id: string) {
    return this.thesisGroupService.remove(id);
  }
}
