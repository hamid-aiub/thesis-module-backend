import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ThesisGroupStudent } from "./thesis-group-student.entity";

@Entity("obe_marks")
export class OBEMarks {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @Column({ type: "uuid" })
  studentId!: string;

  @ApiProperty({ type: () => ThesisGroupStudent })
  @ManyToOne(() => ThesisGroupStudent, { onDelete: "CASCADE" })
  @JoinColumn({ name: "student_id" })
  student!: ThesisGroupStudent;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4 })
  @Column({ type: "int", default: 0 })
  co1!: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 4 })
  @Column({ type: "int", default: 0 })
  co2!: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4 })
  @Column({ type: "int", default: 0 })
  co3!: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 4 })
  @Column({ type: "int", default: 0 })
  co4!: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4 })
  @Column({ type: "int", default: 0 })
  co5!: number;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @Column({ type: "uuid" })
  thesisGroupId!: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
