import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("supervisor_approval_requests")
export class SupervisorApprovalRequest {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "S001" })
  @Column({ type: "varchar" })
  supervisorId!: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  @Column({ type: "uuid", nullable: true })
  semesterId?: string | null;

  @ApiProperty({ example: "additional_groups" })
  @Column({ type: "varchar", default: "additional_groups" })
  type!: "additional_groups" | "extension" | "other";

  @ApiProperty({ example: "pending" })
  @Column({ type: "varchar", default: "pending" })
  status!: "pending" | "approved" | "rejected";

  @ApiProperty({ example: "2026-04-13T09:30:00.000Z" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  requestDate!: Date;

  @ApiProperty({ example: "2026-04-15T12:00:00.000Z", nullable: true })
  @Column({ type: "timestamp", nullable: true })
  responseDate?: Date | null;

  @ApiProperty({ example: "Need one more group due to high student demand" })
  @Column({ type: "text" })
  message!: string;

  @ApiProperty({ example: 4, nullable: true })
  @Column({ type: "int", nullable: true })
  groupCount?: number | null;

  @ApiProperty({
    example: "High demand in Machine Learning domain",
    nullable: true,
  })
  @Column({ type: "text", nullable: true })
  reason?: string | null;

  @ApiProperty({
    example: ["/uploads/thesis-groups/1744530360320-182736123.pdf"],
    type: [String],
  })
  @Column({ type: "jsonb", default: () => "'[]'" })
  attachments!: string[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
