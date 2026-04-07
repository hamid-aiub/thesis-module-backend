import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  FindOneOptions,
  FindManyOptions,
  Repository,
} from "typeorm";
import { User } from "./entities/user.entity";
import { Role, RoleHierarchy } from "@/src/common/enums/role.enum";
import { UserStatsResponseDto } from "./dtos/user-stats-response.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(findOption: FindManyOptions<User>): Promise<User[]> {
    try {
      if (!findOption) findOption = {};
      if (!findOption.relations) {
        findOption.relations = { invited_by: true };
      } else if (Array.isArray(findOption.relations)) {
        if (!findOption.relations.includes("invited_by")) {
          findOption.relations.push("invited_by");
        }
      } else {
        (findOption.relations as any).invited_by = true;
      }
      if (!findOption.order) {
        findOption.order = { created_at: "ASC" };
      }
      return await this.userRepository.find(findOption);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async findOne(
    findOption: FindOneOptions<User>,
    throwError = false,
  ): Promise<User | null> {
    try {
      if (!findOption.relations) {
        findOption.relations = { invited_by: true };
      } else if (Array.isArray(findOption.relations)) {
        if (!findOption.relations.includes("invited_by")) {
          findOption.relations.push("invited_by");
        }
      } else {
        (findOption.relations as any).invited_by = true;
      }
      const user = await this.userRepository.findOne(findOption);

      if (!user && throwError) {
        throw new NotFoundException("User not found");
      }
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException();
    }
  }
}
