import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ThesisGroup } from "./thesis-group.entity";

@Entity("thesis_group_students")
export class ThesisGroupStudent {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "22-12345-1" })
  @Column()
  studentId!: string;

  @ApiProperty({ example: "Alice Johnson" })
  @Column()
  name!: string;

  @ApiProperty({ example: "3.75" })
  @Column({ type: "varchar", length: 10 })
  cgpa!: string;

  @ApiProperty({ example: "22-12345-1@student.aiub.edu" })
  @Column()
  primaryEmail!: string;

  @ApiProperty({ example: "alice.personal@example.com", nullable: true })
  @Column({ nullable: true })
  secondaryEmail?: string;

  @ApiProperty({ example: "+8801XXXXXXXXX" })
  @Column()
  phoneNo!: string;

  @ApiProperty({ example: "120" })
  @Column({ type: "varchar", length: 20 })
  creditCompleted!: string;

  @ApiProperty({ example: "3", nullable: true })
  @Column({ type: "varchar", length: 20, nullable: true })
  creditTakeWithThesis?: string;

  @ApiProperty({ enum: ["yes", "no"], default: "no" })
  @Column({ type: "varchar", length: 3, default: "no" })
  researchMethodologyCompleted!: "yes" | "no";

  @Column({ type: "uuid" })
  thesisGroupId!: string;

  @ManyToOne(() => ThesisGroup, (group) => group.students, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "thesis_group_id" })
  thesisGroup!: ThesisGroup;
}
