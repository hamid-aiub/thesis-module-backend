import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  NotFoundException,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { QueryParserPipe } from "@/src/common/pipes";
import { FindManyOptions } from "typeorm";
import { User } from "./entities/user.entity";
import { AuthGuard } from "@/src/common/guard/auth.guard";
import { RolesGuard } from "@/src/common/guard/roles.guard";
import { Roles } from "@/src/common/decorators/roles.decorator";
import { Role } from "@/src/common/enums/role.enum";
import { IpWhitelistGuard } from "@/src/common/guard/ip-white-list.guard";

@ApiTags("User")
@ApiBearerAuth()
@UseGuards(IpWhitelistGuard)
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.USER)
  @ApiOperation({ summary: "Get all users" })
  @ApiOkResponse({ type: [User] })
  async getAllUsers(
    @Query(new QueryParserPipe("MANY", ["first_name", "last_name", "email"]))
    findOption: FindManyOptions<User>,
  ) {
    return this.userService.findAll(findOption);
  }

  @Get(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.USER)
  @ApiOperation({ summary: "Get user details by ID" })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: "User not found" })
  async getUser(@Param("id", ParseUUIDPipe) id: string) {
    return this.userService.findOne({ where: { id } }, true);
  }
}
