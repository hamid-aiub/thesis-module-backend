import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("semesters")
export class Semester {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "Spring 2025-26" })
  @Column({ unique: true })
  semesterName!: string;

  @ApiProperty({ example: "2026-03-03" })
  @Column({ type: "date" })
  groupCreationStart!: string;

  @ApiProperty({ example: "2026-03-22" })
  @Column({ type: "date" })
  groupCreationEnd!: string;

  @ApiProperty({ example: "2026-03-03" })
  @Column({ type: "date" })
  midEvidenceStart!: string;

  @ApiProperty({ example: "2026-04-22" })
  @Column({ type: "date" })
  midEvidenceEnd!: string;

  @ApiProperty({ example: "2026-03-03" })
  @Column({ type: "date" })
  finalEvidenceStart!: string;

  @ApiProperty({ example: "2026-06-22" })
  @Column({ type: "date" })
  finalEvidenceEnd!: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
