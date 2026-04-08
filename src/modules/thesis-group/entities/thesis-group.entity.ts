import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Semester } from "@/src/modules/semester/entities/semester.entity";
import { ThesisGroupDocument } from "./thesis-group-document.entity";
import { ThesisGroupStudent } from "./thesis-group-student.entity";

@Entity("thesis_groups")
export class ThesisGroup {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @Column({ type: "uuid" })
  semesterId!: string;

  @ApiProperty({ type: () => Semester })
  @ManyToOne(() => Semester, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "semester_id" })
  semester!: Semester;

  @ApiProperty({ example: "CSE-501", nullable: true })
  @Column({ type: "varchar", nullable: true })
  classId?: string;

  @ApiProperty({ example: "06", nullable: true })
  @Column({ type: "varchar", length: 10, nullable: true })
  globalGroupSerial?: string;

  @ApiProperty({ example: "G01", nullable: true })
  @Column({ type: "varchar", length: 20, nullable: true })
  supervisorGroup?: string;

  @ApiProperty({ example: "EXT-2026-001", nullable: true })
  @Column({ type: "varchar", nullable: true })
  externalId?: string;

  @ApiProperty({ example: "Dr. External Reviewer", nullable: true })
  @Column({ type: "varchar", nullable: true })
  externalName?: string;

  @ApiProperty({
    example: "Need to refine methodology section before mid review.",
    nullable: true,
  })
  @Column({ type: "text", nullable: true })
  thesisManagementTeamRemark?: string;

  @ApiProperty({
    example: "Students need to improve literature survey quality.",
    nullable: true,
  })
  @Column({ type: "text", nullable: true })
  supervisorRemark?: string;

  @ApiProperty({ example: "S001" })
  @Column()
  supervisorId!: string;

  @ApiProperty({ example: "Dr. John Doe" })
  @Column()
  supervisorName!: string;

  @ApiProperty({ example: "john.doe@aiub.edu" })
  @Column()
  supervisorEmail!: string;

  @ApiProperty({ example: "AI-based Early Disease Detection" })
  @Column({ type: "varchar", length: 300 })
  proposedTitle!: string;

  @ApiProperty({ example: "Machine Learning" })
  @Column()
  thesisDomain!: string;

  @ApiProperty({ example: "This thesis proposes a practical ML workflow..." })
  @Column({ type: "text" })
  shortDescription!: string;

  @ApiProperty({ example: "uploads/literature-review.pdf", nullable: true })
  @Column({ type: "varchar", nullable: true })
  literatureReview?: string;

  @ApiProperty({ example: "uploads/project-proposal.pdf", nullable: true })
  @Column({ type: "varchar", nullable: true })
  projectProposal?: string;

  @ApiProperty({ example: 2, minimum: 2, maximum: 4 })
  @Column({ type: "int" })
  numberOfStudents!: number;

  @ApiProperty({ example: true })
  @Column({ type: "boolean", default: false })
  acceptTerms!: boolean;

  @ApiProperty({ type: () => [ThesisGroupStudent] })
  @OneToMany(() => ThesisGroupStudent, (student) => student.thesisGroup, {
    cascade: true,
  })
  students!: ThesisGroupStudent[];

  @ApiProperty({ type: () => [ThesisGroupDocument] })
  @OneToMany(() => ThesisGroupDocument, (document) => document.thesisGroup)
  documents!: ThesisGroupDocument[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
