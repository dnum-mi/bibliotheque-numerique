import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletingJobLogs1701955302224 implements MigrationInterface {
    name = 'DeletingJobLogs1701955302224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('job_logs')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
