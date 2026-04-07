import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import { Role } from "@/src/common/enums/role.enum";

export class CreateUsersTable1731519065000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "first_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "last_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "password_changed_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "role",
            type: "enum",
            enum: Object.values(Role),
            default: `'${Role.USER}'`,
          },
          {
            name: "last_login_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "invited_by_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP(6)",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP(6)",
          },
        ],
      }),
    );

    // 👇 Add foreign key relation for self reference
    await queryRunner.createForeignKey(
      "users",
      new TableForeignKey({
        columnNames: ["invited_by_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL", // Recommended for optional relation
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK first
    const table = await queryRunner.getTable("users");
    const fk = table!.foreignKeys.find((fk) =>
      fk.columnNames.includes("invited_by_id"),
    );
    if (fk) await queryRunner.dropForeignKey("users", fk);

    // Drop table
    await queryRunner.dropTable("users");
  }
}
