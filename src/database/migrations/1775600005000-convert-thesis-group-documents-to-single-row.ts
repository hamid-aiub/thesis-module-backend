import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class ConvertThesisGroupDocumentsToSingleRow1775600005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE thesis_group_documents
      ADD COLUMN IF NOT EXISTS literature_review varchar,
      ADD COLUMN IF NOT EXISTS project_proposal varchar,
      ADD COLUMN IF NOT EXISTS progress_report varchar,
      ADD COLUMN IF NOT EXISTS final_thesis_book varchar,
      ADD COLUMN IF NOT EXISTS plagiarism_report varchar,
      ADD COLUMN IF NOT EXISTS ai_detection_report varchar,
      ADD COLUMN IF NOT EXISTS presentation_slide varchar,
      ADD COLUMN IF NOT EXISTS poster varchar
    `);

    await queryRunner.query(`
      UPDATE thesis_group_documents keeper
      SET
        literature_review = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'literature_review'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        project_proposal = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'project_proposal'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        progress_report = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'progress_report'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        final_thesis_book = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'final_thesis_book'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        plagiarism_report = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'plagiarism_report'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        ai_detection_report = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'ai_detection_report'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        presentation_slide = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'presentation_slide'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        poster = (
          SELECT d.file_path
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'poster'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        plagiarism_percentage = (
          SELECT d.plagiarism_percentage
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'plagiarism_report'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        ),
        ai_detection_percentage = (
          SELECT d.ai_detection_percentage
          FROM thesis_group_documents d
          WHERE d.thesis_group_id = keeper.thesis_group_id
            AND d.document_type = 'ai_detection_report'
          ORDER BY d.updated_at DESC, d.created_at DESC
          LIMIT 1
        )
      WHERE keeper.id IN (
        SELECT selected.id
        FROM (
          SELECT DISTINCT ON (thesis_group_id) id
          FROM thesis_group_documents
          ORDER BY thesis_group_id, updated_at DESC, created_at DESC, id DESC
        ) selected
      )
    `);

    await queryRunner.query(`
      DELETE FROM thesis_group_documents
      WHERE id NOT IN (
        SELECT selected.id
        FROM (
          SELECT DISTINCT ON (thesis_group_id) id
          FROM thesis_group_documents
          ORDER BY thesis_group_id, updated_at DESC, created_at DESC, id DESC
        ) selected
      )
    `);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_tgd_group_semester_document_type"`,
    );

    await queryRunner.query(`
      ALTER TABLE thesis_group_documents
      DROP COLUMN IF EXISTS document_type,
      DROP COLUMN IF EXISTS file_path
    `);

    await queryRunner.query(`
      ALTER TABLE thesis_group_documents
      ALTER COLUMN thesis_group_id SET NOT NULL
    `);

    await queryRunner.createIndex(
      "thesis_group_documents",
      new TableIndex({
        name: "UQ_tgd_group",
        columnNames: ["thesis_group_id"],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_tgd_group"`);

    await queryRunner.query(`
      ALTER TABLE thesis_group_documents
      ADD COLUMN IF NOT EXISTS document_type varchar(60),
      ADD COLUMN IF NOT EXISTS file_path varchar
    `);

    await queryRunner.query(`
      UPDATE thesis_group_documents
      SET
        document_type = CASE
          WHEN progress_report IS NOT NULL THEN 'progress_report'
          WHEN final_thesis_book IS NOT NULL THEN 'final_thesis_book'
          WHEN plagiarism_report IS NOT NULL THEN 'plagiarism_report'
          WHEN ai_detection_report IS NOT NULL THEN 'ai_detection_report'
          WHEN presentation_slide IS NOT NULL THEN 'presentation_slide'
          WHEN poster IS NOT NULL THEN 'poster'
          WHEN literature_review IS NOT NULL THEN 'literature_review'
          WHEN project_proposal IS NOT NULL THEN 'project_proposal'
          ELSE 'progress_report'
        END,
        file_path = COALESCE(
          progress_report,
          final_thesis_book,
          plagiarism_report,
          ai_detection_report,
          presentation_slide,
          poster,
          literature_review,
          project_proposal
        )
    `);

    await queryRunner.query(`
      ALTER TABLE thesis_group_documents
      DROP COLUMN IF EXISTS literature_review,
      DROP COLUMN IF EXISTS project_proposal,
      DROP COLUMN IF EXISTS progress_report,
      DROP COLUMN IF EXISTS final_thesis_book,
      DROP COLUMN IF EXISTS plagiarism_report,
      DROP COLUMN IF EXISTS ai_detection_report,
      DROP COLUMN IF EXISTS presentation_slide,
      DROP COLUMN IF EXISTS poster
    `);
  }
}
