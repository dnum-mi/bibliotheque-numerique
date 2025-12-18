import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration des champs `fields.stringValue` référencant un organisme (RNA / RNF).
 *
 * Historiquement, certains champs contenaient :
 *  - soit directement un identifiant RNA / RNF
 *  - soit une valeur préfixée (ex: "ERROR-W123456789", "QUEUE-055-FDD-00004-56")
 *
 * Cette migration :
 *  1. Isole proprement l'identifiant RNA ou RNF à partir de son format officiel
 *     (RNA: W#########, RNF: ###-AAAA-#####-##), indépendamment des préfixes.
 *  2. Résout l’organisme correspondant via la table `organismes`.
 *  3. Remplace la valeur par une forme lisible et stable :
 *        "<id> | <title>"
 *
 * Si aucun identifiant valide ou aucun organisme n’est trouvé,
 * la ligne n’est pas modifiée.
 *
 * Objectif : supprimer toute dépendance technique aux IDs d’organismes
 * et figer une valeur métier lisible avant suppression de la table `organismes`.
 */
export class NoMoreOrganismeInFields1765977164642 implements MigrationInterface {
    name = 'NoMoreOrganismeInFields1765977164642'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        WITH extracted AS (
          SELECT
            f."id" AS "fieldId",
            f."formatFunctionRef" AS "kind",
            CASE
              WHEN f."formatFunctionRef" = 'rna'
                THEN substring(f."stringValue" FROM '(W[0-9][0-9A-Z]{2}[0-9]{6})')
              WHEN f."formatFunctionRef" = 'rnf'
                THEN substring(f."stringValue" FROM '([0-9]{3}-[A-Z]{3,4}-[0-9]{5}-[0-9]{2})')
              ELSE NULL
              END AS "orgRef"
          FROM "fields" f
          WHERE f."formatFunctionRef" IN ('rna', 'rnf')
            AND f."stringValue" IS NOT NULL
        ),
             resolved AS (
               SELECT
                 e."fieldId",
                 e."orgRef",
                 o."title"
               FROM extracted e
                      LEFT JOIN "organismes" o
                                ON (e."kind" = 'rna' AND o."idRna" = e."orgRef")
                                  OR (e."kind" = 'rnf' AND o."idRnf" = e."orgRef")
               WHERE e."orgRef" IS NOT NULL
             )
        UPDATE "fields" f
        SET "stringValue" = CASE
                              WHEN r."title" IS NOT NULL THEN r."orgRef" || ' | ' || r."title"
                              ELSE r."orgRef"
          END
          FROM resolved r
        WHERE f."id" = r."fieldId";
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      console.log("Sorry petit developpeur, il n'y a pas de retour en arrière");
    }

}
