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
import { Semester } from "@/src/modules/semester/entities/semester.entity";
import { ThesisGroup } from "./thesis-group.entity";

@Entity("thesis_group_documents")
export class ThesisGroupDocument {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @Column({ type: "uuid" })
  thesisGroupId!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @Column({ type: "uuid" })
  semesterId!: string;

  @ApiProperty({ example: "/uploads/thesis-groups/lr.pdf", nullable: true })
  @Column({ type: "varchar", nullable: true })
  literatureReview?: string | null;

  @ApiProperty({
    example: "/uploads/thesis-groups/proposal.pdf",
    nullable: true,
  })
  @Column({ type: "varchar", nullable: true })
  projectProposal?: string | null;

  @ApiProperty({
    example: "/uploads/thesis-groups/progress.pdf",
    nullable: true,
  })
  @Column({ type: "varchar", nullable: true })
  progressReport?: string | null;

  @ApiProperty({
    example: "/uploads/thesis-groups/final-book.pdf",
    nullable: true,
  })
  @Column({ type: "varchar", nullable: true })
  finalThesisBook?: string | null;

  @ApiProperty({
    example: "/uploads/thesis-groups/plagiarism.pdf",
    nullable: true,
  })
  @Column({ type: "varchar", nullable: true })
  plagiarismReport?: string | null;

  @ApiProperty({ example: "/uploads/thesis-groups/ai.pdf", nullable: true })
  @Column({ type: "varchar", nullable: true })
  aiDetectionReport?: string | null;

  @ApiProperty({
    example: "/uploads/thesis-groups/slides.pptx",
    nullable: true,
  })
  @Column({ type: "varchar", nullable: true })
  presentationSlide?: string | null;

  @ApiProperty({ example: "/uploads/thesis-groups/poster.pdf", nullable: true })
  @Column({ type: "varchar", nullable: true })
  poster?: string | null;

  @ApiProperty({ example: 12.5, nullable: true })
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  plagiarismPercentage?: number | null;

  @ApiProperty({ example: 10.0, nullable: true })
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  aiDetectionPercentage?: number | null;

  @ApiProperty({ type: () => ThesisGroup })
  @ManyToOne(() => ThesisGroup, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "thesis_group_id" })
  thesisGroup!: ThesisGroup;

  @ApiProperty({ type: () => Semester })
  @ManyToOne(() => Semester, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "semester_id" })
  semester!: Semester;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
