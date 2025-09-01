import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDepartmentCorse1748251805946 implements MigrationInterface {
    name = 'UpdateDepartmentCorse1748251805946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // #region USER PREFECFTURE
        await queryRunner.query(`ALTER TYPE "public"."users_prefecture_enum" RENAME TO "users_prefecture_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_prefecture_enum" AS ENUM('00 - Ministère de l''Intérieur', '01 - Ain', '02 - Aisne', '03 - Allier', '04 - Alpes de Haute-Provence', '05 - Hautes-Alpes', '06 - Alpes-Maritimes', '07 - Ardèche', '08 - Ardennes', '09 - Ariège', '10 - Aube', '11 - Aude', '12 - Aveyron', '13 - Bouches-du-Rhône', '14 - Calvados', '15 - Cantal', '16 - Charente', '17 - Charente-Maritime', '18 - Cher', '19 - Corrèze', '2A - Corse du Sud', '2B - Haute-Corse', '21 - Côte d''Or', '22 - Côtes d''Armor', '23 - Creuse', '24 - Dordogne', '25 - Doubs', '26 - Drôme', '27 - Eure', '28 - Eure-et-Loir', '29 - Finistère', '30 - Gard', '31 - Haute-Garonne', '32 - Gers', '33 - Gironde', '34 - Hérault', '35 - Ille-et-Vilaine', '36 - Indre', '37 - Indre-et-Loire', '38 - Isère', '39 - Jura', '40 - Landes', '41 - Loir-et-Cher', '42 - Loire', '43 - Haute-Loire', '44 - Loire-Atlantique', '45 - Loiret', '46 - Lot', '47 - Lot-et-Garonne', '48 - Lozère', '49 - Maine-et-Loire', '50 - Manche', '51 - Marne', '52 - Haute-Marne', '53 - Mayenne', '54 - Meurthe-et-Moselle', '55 - Meuse', '56 - Morbihan', '57 - Moselle', '58 - Nièvre', '59 - Nord', '60 - Oise', '61 - Orne', '62 - Pas-de-Calais', '63 - Puy-de-Dôme', '64 - Pyrénées-Atlantiques', '65 - Hautes-Pyrénées', '66 - Pyrénées-Orientales', '67 - Bas-Rhin', '68 - Haut-Rhin', '69 - Rhône', '70 - Haute-Saône', '71 - Saône-et-Loire', '72 - Sarthe', '73 - Savoie', '74 - Haute-Savoie', '75 - Paris', '76 - Seine-Maritime', '77 - Seine-et-Marne', '78 - Yvelines', '79 - Deux-Sèvres', '80 - Somme', '81 - Tarn', '82 - Tarn-et-Garonne', '83 - Var', '84 - Vaucluse', '85 - Vendée', '86 - Vienne', '87 - Haute-Vienne', '88 - Vosges', '89 - Yonne', '90 - Territoire de Belfort', '91 - Essonne', '92 - Hauts-de-Seine', '93 - Seine-Saint-Denis', '94 - Val-de-Marne', '95 - Val-d''Oise', '971 - Guadeloupe', '972 - Martinique', '973 - Guyane', '974 - La Réunion', '975 - Saint-Pierre-et-Miquelon', '976 - Mayotte', '977 - Saint-Barthélemy', '978 - Saint-Martin', '984 - Terres australes et antarctiques françaises', '986 - Wallis-et-Futuna', '987 - Polynésie Française', '988 - Nouvelle-Calédonie')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "prefecture" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "users"
          ALTER COLUMN "prefecture" TYPE "public"."users_prefecture_enum"
          USING CASE
            WHEN "prefecture" = '20A - Corse du Sud' THEN '2A - Corse du Sud'::text::"public"."users_prefecture_enum"
            WHEN "prefecture" = '20B - Haute-Corse' THEN '2B - Haute-Corse'::text::"public"."users_prefecture_enum"
            ELSE "prefecture"::text::"public"."users_prefecture_enum"
          END`);

        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "prefecture" SET DEFAULT '75 - Paris'`);

        // #region DOSSIER PREFECFTURE
        await queryRunner.query(`DROP TYPE "public"."users_prefecture_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."dossiers_prefecture_enum" RENAME TO "dossiers_prefecture_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."dossiers_prefecture_enum" AS ENUM('D00', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D2A', 'D2B', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32', 'D33', 'D34', 'D35', 'D36', 'D37', 'D38', 'D39', 'D40', 'D41', 'D42', 'D43', 'D44', 'D45', 'D46', 'D47', 'D48', 'D49', 'D50', 'D51', 'D52', 'D53', 'D54', 'D55', 'D56', 'D57', 'D58', 'D59', 'D60', 'D61', 'D62', 'D63', 'D64', 'D65', 'D66', 'D67', 'D68', 'D69', 'D70', 'D71', 'D72', 'D73', 'D74', 'D75', 'D76', 'D77', 'D78', 'D79', 'D80', 'D81', 'D82', 'D83', 'D84', 'D85', 'D86', 'D87', 'D88', 'D89', 'D90', 'D91', 'D92', 'D93', 'D94', 'D95', 'D971', 'D972', 'D973', 'D974', 'D975', 'D976', 'D977', 'D978', 'D984', 'D986', 'D987', 'D988')`);

        await queryRunner.query(`ALTER TABLE "dossiers" ALTER COLUMN "prefecture" TYPE "public"."dossiers_prefecture_enum"
          USING CASE
            WHEN "prefecture" = 'D20A' THEN 'D2A'::text::"dossiers_prefecture_enum"
            WHEN "prefecture" = 'D20B' THEN 'D2B'::text::"dossiers_prefecture_enum"
            ELSE "prefecture"::"text"::"public"."dossiers_prefecture_enum"
          END`);

        await queryRunner.query(`DROP TYPE "public"."dossiers_prefecture_enum_old"`);
        // #endregion DOSSIER PREFECFTURE
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // #region DOSSIER PREFECFTURE
        await queryRunner.query(`CREATE TYPE "public"."dossiers_prefecture_enum_old" AS ENUM('D00', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20A', 'D20B', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32', 'D33', 'D34', 'D35', 'D36', 'D37', 'D38', 'D39', 'D40', 'D41', 'D42', 'D43', 'D44', 'D45', 'D46', 'D47', 'D48', 'D49', 'D50', 'D51', 'D52', 'D53', 'D54', 'D55', 'D56', 'D57', 'D58', 'D59', 'D60', 'D61', 'D62', 'D63', 'D64', 'D65', 'D66', 'D67', 'D68', 'D69', 'D70', 'D71', 'D72', 'D73', 'D74', 'D75', 'D76', 'D77', 'D78', 'D79', 'D80', 'D81', 'D82', 'D83', 'D84', 'D85', 'D86', 'D87', 'D88', 'D89', 'D90', 'D91', 'D92', 'D93', 'D94', 'D95', 'D971', 'D972', 'D973', 'D974', 'D975', 'D976', 'D977', 'D978', 'D984', 'D986', 'D987', 'D988')`);
        await queryRunner.query(`ALTER TABLE "dossiers" ALTER COLUMN "prefecture" TYPE "public"."dossiers_prefecture_enum_old"
          USING CASE
            WHEN "prefecture" = 'D2A' THEN 'D20A'::text::"dossiers_prefecture_enum_old"
            WHEN "prefecture" = 'D2B' THEN 'D20B'::text::"dossiers_prefecture_enum_old"
            ELSE "prefecture"::"text"::"public"."dossiers_prefecture_enum_old"
          END`);
        await queryRunner.query(`DROP TYPE "public"."dossiers_prefecture_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."dossiers_prefecture_enum_old" RENAME TO "dossiers_prefecture_enum"`);
        // #endregion DOSSIER PREFECFTURE
        // #region USER PREFECFTURE
        await queryRunner.query(`CREATE TYPE "public"."users_prefecture_enum_old" AS ENUM('00 - Ministère de l''Intérieur', '01 - Ain', '02 - Aisne', '03 - Allier', '04 - Alpes de Haute-Provence', '05 - Hautes-Alpes', '06 - Alpes-Maritimes', '07 - Ardèche', '08 - Ardennes', '09 - Ariège', '10 - Aube', '11 - Aude', '12 - Aveyron', '13 - Bouches-du-Rhône', '14 - Calvados', '15 - Cantal', '16 - Charente', '17 - Charente-Maritime', '18 - Cher', '19 - Corrèze', '20A - Corse du Sud', '20B - Haute-Corse', '21 - Côte d''Or', '22 - Côtes d''Armor', '23 - Creuse', '24 - Dordogne', '25 - Doubs', '26 - Drôme', '27 - Eure', '28 - Eure-et-Loir', '29 - Finistère', '30 - Gard', '31 - Haute-Garonne', '32 - Gers', '33 - Gironde', '34 - Hérault', '35 - Ille-et-Vilaine', '36 - Indre', '37 - Indre-et-Loire', '38 - Isère', '39 - Jura', '40 - Landes', '41 - Loir-et-Cher', '42 - Loire', '43 - Haute-Loire', '44 - Loire-Atlantique', '45 - Loiret', '46 - Lot', '47 - Lot-et-Garonne', '48 - Lozère', '49 - Maine-et-Loire', '50 - Manche', '51 - Marne', '52 - Haute-Marne', '53 - Mayenne', '54 - Meurthe-et-Moselle', '55 - Meuse', '56 - Morbihan', '57 - Moselle', '58 - Nièvre', '59 - Nord', '60 - Oise', '61 - Orne', '62 - Pas-de-Calais', '63 - Puy-de-Dôme', '64 - Pyrénées-Atlantiques', '65 - Hautes-Pyrénées', '66 - Pyrénées-Orientales', '67 - Bas-Rhin', '68 - Haut-Rhin', '69 - Rhône', '70 - Haute-Saône', '71 - Saône-et-Loire', '72 - Sarthe', '73 - Savoie', '74 - Haute-Savoie', '75 - Paris', '76 - Seine-Maritime', '77 - Seine-et-Marne', '78 - Yvelines', '79 - Deux-Sèvres', '80 - Somme', '81 - Tarn', '82 - Tarn-et-Garonne', '83 - Var', '84 - Vaucluse', '85 - Vendée', '86 - Vienne', '87 - Haute-Vienne', '88 - Vosges', '89 - Yonne', '90 - Territoire de Belfort', '91 - Essonne', '92 - Hauts-de-Seine', '93 - Seine-Saint-Denis', '94 - Val-de-Marne', '95 - Val-d''Oise', '971 - Guadeloupe', '972 - Martinique', '973 - Guyane', '974 - La Réunion', '975 - Saint-Pierre-et-Miquelon', '976 - Mayotte', '977 - Saint-Barthélemy', '978 - Saint-Martin', '984 - Terres australes et antarctiques françaises', '986 - Wallis-et-Futuna', '987 - Polynésie Française', '988 - Nouvelle-Calédonie')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "prefecture" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "prefecture" TYPE "public"."users_prefecture_enum_old"
          USING CASE
            WHEN "prefecture" = '2A - Corse du Sud' THEN '20A - Corse du Sud'::text::"users_prefecture_enum_old"
            WHEN "prefecture" = '2B - Haute-Corse' THEN '20B - Haute-Corse'::text::"users_prefecture_enum_old"
            ELSE "prefecture"::"text"::"public"."users_prefecture_enum_old"
          END`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "prefecture" SET DEFAULT '75 - Paris'`);
        await queryRunner.query(`DROP TYPE "public"."users_prefecture_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_prefecture_enum_old" RENAME TO "users_prefecture_enum"`);
        // #endregion USER PREFECFTURE
    }

}
