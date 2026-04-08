import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddSemesterIdToThesisGroups1775600002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const thesisGroupsTable = await queryRunner.getTable("thesis_groups");

    const addColumnIfMissing = async (column: TableColumn) => {
      const hasColumn = thesisGroupsTable?.columns.some(
        (existingColumn) => existingColumn.name === column.name,
      );

      if (!hasColumn) {
        await queryRunner.addColumn("thesis_groups", column);
      }
    };

    const hasSemesterId = thesisGroupsTable?.columns.some(
      (column) => column.name === "semester_id",
    );

    if (!hasSemesterId) {
      await queryRunner.addColumn(
        "thesis_groups",
        new TableColumn({
          name: "semester_id",
          type: "uuid",
          isNullable: true,
        }),
      );
    }

    await addColumnIfMissing(
      new TableColumn({
        name: "class_id",
        type: "varchar",
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: "global_group_serial",
        type: "varchar",
        length: "10",
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: "supervisor_group",
        type: "varchar",
        length: "20",
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: "external_id",
        type: "varchar",
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: "external_name",
        type: "varchar",
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: "thesis_management_team_remark",
        type: "text",
        isNullable: true,
      }),
    );

    await addColumnIfMissing(
      new TableColumn({
        name: "supervisor_remark",
        type: "text",
        isNullable: true,
      }),
    );

    const updatedTable = await queryRunner.getTable("thesis_groups");
    const hasSemesterFk = updatedTable?.foreignKeys.some((fk) =>
      fk.columnNames.includes("semester_id"),
    );

    if (!hasSemesterFk) {
      await queryRunner.createForeignKey(
        "thesis_groups",
        new TableForeignKey({
          columnNames: ["semester_id"],
          referencedTableName: "semesters",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dropColumnIfPresent = async (columnName: string) => {
      const table = await queryRunner.getTable("thesis_groups");
      const targetColumn = table?.columns.find(
        (column) => column.name === columnName,
      );

      if (targetColumn) {
        await queryRunner.dropColumn("thesis_groups", targetColumn);
      }
    };

    await dropColumnIfPresent("supervisor_remark");
    await dropColumnIfPresent("thesis_management_team_remark");
    await dropColumnIfPresent("external_name");
    await dropColumnIfPresent("external_id");
    await dropColumnIfPresent("supervisor_group");
    await dropColumnIfPresent("global_group_serial");
    await dropColumnIfPresent("class_id");

    const thesisGroupsTable = await queryRunner.getTable("thesis_groups");
    const semesterFk = thesisGroupsTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes("semester_id"),
    );

    if (semesterFk) {
      await queryRunner.dropForeignKey("thesis_groups", semesterFk);
    }

    const refreshedTable = await queryRunner.getTable("thesis_groups");
    const semesterColumn = refreshedTable?.columns.find(
      (column) => column.name === "semester_id",
    );

    if (semesterColumn) {
      await queryRunner.dropColumn("thesis_groups", semesterColumn);
    }
  }
}
