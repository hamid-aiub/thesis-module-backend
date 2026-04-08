import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class EnforceUniqueThesisGroupDocumentType1775600004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Keep only the most recently updated row per (group, semester, document_type).
    await queryRunner.query(`
      DELETE FROM thesis_group_documents d
      WHERE d.id IN (
        SELECT id FROM (
          SELECT
            id,
            ROW_NUMBER() OVER (
              PARTITION BY thesis_group_id, semester_id, document_type
              ORDER BY updated_at DESC, created_at DESC, id DESC
            ) AS row_num
          FROM thesis_group_documents
        ) ranked
        WHERE ranked.row_num > 1
      )
    `);

    await queryRunner.createIndex(
      "thesis_group_documents",
      new TableIndex({
        name: "UQ_tgd_group_semester_document_type",
        columnNames: ["thesis_group_id", "semester_id", "document_type"],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "thesis_group_documents",
      "UQ_tgd_group_semester_document_type",
    );
  }
}
