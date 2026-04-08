import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateThesisGroupDocumentsTable1775600003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "thesis_group_documents",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "thesis_group_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "semester_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "document_type",
            type: "varchar",
            length: "60",
            isNullable: false,
          },
          {
            name: "file_path",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "plagiarism_percentage",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: "ai_detection_percentage",
            type: "decimal",
            precision: 5,
            scale: 2,
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

    await queryRunner.createForeignKey(
      "thesis_group_documents",
      new TableForeignKey({
        columnNames: ["thesis_group_id"],
        referencedTableName: "thesis_groups",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "thesis_group_documents",
      new TableForeignKey({
        columnNames: ["semester_id"],
        referencedTableName: "semesters",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
      }),
    );

    await queryRunner.createIndex(
      "thesis_group_documents",
      new TableIndex({
        name: "IDX_tgd_group_semester",
        columnNames: ["thesis_group_id", "semester_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("thesis_group_documents");
    const groupFk = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes("thesis_group_id"),
    );
    const semesterFk = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes("semester_id"),
    );

    if (groupFk) {
      await queryRunner.dropForeignKey("thesis_group_documents", groupFk);
    }

    if (semesterFk) {
      await queryRunner.dropForeignKey("thesis_group_documents", semesterFk);
    }

    const index = table?.indices.find(
      (i) => i.name === "IDX_tgd_group_semester",
    );
    if (index) {
      await queryRunner.dropIndex("thesis_group_documents", index);
    }

    await queryRunner.dropTable("thesis_group_documents");
  }
}
