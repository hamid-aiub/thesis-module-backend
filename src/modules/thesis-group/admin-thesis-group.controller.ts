import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { FindManyOptions } from "typeorm";
import { QueryParserPipe } from "@/src/common/pipes";
import { ThesisGroup } from "./entities/thesis-group.entity";
import { ThesisGroupService } from "./thesis-group.service";

@ApiTags("Admin")
@Controller("admin")
export class AdminThesisGroupController {
  constructor(private readonly thesisGroupService: ThesisGroupService) {}

  @Get("approval-requests")
  @ApiOperation({ summary: "Get all supervisor approval requests for admin" })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiQuery({ name: "semesterId", required: false, type: String })
  async getAdminApprovalRequests(
    @Query("status") status?: string,
    @Query("semesterId") semesterId?: string,
  ) {
    return this.thesisGroupService.getAdminApprovalRequests({
      status: status as "pending" | "approved" | "rejected" | undefined,
      semesterId,
    });
  }

  @Patch("approval-requests/:id/respond")
  @ApiOperation({ summary: "Approve or reject a supervisor approval request" })
  async respondToApprovalRequest(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const status =
      typeof body.status === "string" ? body.status.trim().toLowerCase() : "";

    if (status !== "approved" && status !== "rejected") {
      throw new BadRequestException(
        "status must be either approved or rejected",
      );
    }

    return this.thesisGroupService.respondToApprovalRequest(id, {
      status: status as "approved" | "rejected",
    });
  }

  @Get("thesis-groups")
  @ApiOperation({
    summary: "Get all thesis groups with OBE marks for admin dashboard",
  })
  @ApiQuery({ name: "semesterId", required: false, type: String })
  @ApiOkResponse({ type: [ThesisGroup] })
  async getAdminThesisGroups(
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
    return this.thesisGroupService.findAllWithOBEMarks(findOption);
  }

  @Get("thesis-groups/:id")
  @ApiOperation({
    summary: "Get thesis group by ID with OBE marks",
  })
  @ApiOkResponse({ type: ThesisGroup })
  async getAdminThesisGroup(@Param("id", ParseUUIDPipe) id: string) {
    return this.thesisGroupService.findOneWithOBEMarks(id);
  }
}
