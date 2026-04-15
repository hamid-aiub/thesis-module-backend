import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupervisorThesisGroupController } from "./supervisor-thesis-group.controller";
import { AdminThesisGroupController } from "./admin-thesis-group.controller";
import { SupervisorApprovalRequest } from "./entities/supervisor-approval-request.entity";
import { ThesisGroupController } from "./thesis-group.controller";
import { ThesisGroupDocument } from "./entities/thesis-group-document.entity";
import { ThesisGroupStudent } from "./entities/thesis-group-student.entity";
import { ThesisGroup } from "./entities/thesis-group.entity";
import { OBEMarks } from "./entities/obe-marks.entity";
import { ThesisGroupService } from "./thesis-group.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ThesisGroup,
      ThesisGroupStudent,
      ThesisGroupDocument,
      SupervisorApprovalRequest,
      OBEMarks,
    ]),
  ],
  controllers: [
    ThesisGroupController,
    SupervisorThesisGroupController,
    AdminThesisGroupController,
  ],
  providers: [ThesisGroupService],
  exports: [ThesisGroupService],
})
export class ThesisGroupModule {}
