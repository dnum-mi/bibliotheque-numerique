import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateJobLog1684839244846 implements MigrationInterface {
  name = 'CreateJobLog1684839244846'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'job_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            generationStrategy: 'increment',
          },
          {
            name: 'overAt',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
          {
            name: 'jobName',
            type: 'enum',
            default: "'no job name given.'",
            isNullable: false,
            enum: ['no job name given.', 'ds-data-fetching'],
          },
          {
            name: 'jobStatus',
            type: 'enum',
            default: "'running'",
            isNullable: false,
            enum: ['success', 'failure', 'running'],
          },
          {
            name: 'log',
            type: 'character varying',
            isNullable: true,
          },
          {
            name: 'createAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updateAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('job_logs')
  }
}
