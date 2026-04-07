import { Role } from "@/src/common/enums/role.enum";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ example: "John", nullable: true })
  @Column()
  first_name?: string;

  @ApiProperty({ example: "Doe", nullable: true })
  @Column()
  last_name?: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @Column()
  email!: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ select: false })
  password!: string;

  @ApiHideProperty()
  @Column({ type: "timestamp", nullable: true })
  password_changed_at?: Date;

  @ApiProperty({ enum: Role, default: Role.USER })
  @Column({
    type: "enum",
    enum: Role,
    default: Role.USER,
  })
  role?: Role;

  @ApiProperty({ nullable: true })
  @Column({
    type: "timestamp",
    nullable: true,
  })
  last_login_at?: Date;

  // Self Relation: Many users can be invited by one user
  @ApiProperty({ type: () => User, nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "invited_by_id" })
  invited_by?: User;

  @ApiProperty()
  @CreateDateColumn()
  created_at?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at?: Date;
}
