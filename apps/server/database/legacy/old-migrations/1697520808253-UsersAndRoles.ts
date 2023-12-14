import { MigrationInterface, QueryRunner } from 'typeorm'

export class UsersAndRoles1697520808253 implements MigrationInterface {
  name = 'UsersAndRoles1697520808253'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminRoleId = await queryRunner.query('SELECT "id" FROM roles WHERE name = $1', ['admin'])
    const usersId = await queryRunner.query('SELECT "usersId" FROM users_roles WHERE "rolesId" = $1', [adminRoleId?.[0]?.id])
    await queryRunner.dropTable('users_roles')
    await queryRunner.dropTable('roles')
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastname" character varying NOT NULL DEFAULT ''`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" ADD "firstname" character varying NOT NULL DEFAULT ''`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" jsonb NOT NULL DEFAULT '{"label":null,"options":[]}'`,
    )
    if (usersId?.length) {
      await queryRunner.query(`UPDATE "users" SET "role" = $1 WHERE "id" = ANY($2)`,
        [JSON.stringify({label: 'sudo', options:[]}), usersId.map(u => u.usersId)])
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstname"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastname"`)
  }
}
