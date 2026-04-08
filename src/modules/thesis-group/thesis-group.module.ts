import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupervisorThesisGroupController } from "./supervisor-thesis-group.controller";
import { ThesisGroupController } from "./thesis-group.controller";
import { ThesisGroupDocument } from "./entities/thesis-group-document.entity";
import { ThesisGroupStudent } from "./entities/thesis-group-student.entity";
import { ThesisGroup } from "./entities/thesis-group.entity";
import { ThesisGroupService } from "./thesis-group.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ThesisGroup,
      ThesisGroupStudent,
      ThesisGroupDocument,
    ]),
  ],
  controllers: [ThesisGroupController, SupervisorThesisGroupController],
  providers: [ThesisGroupService],
  exports: [ThesisGroupService],
})
export class ThesisGroupModule {}
