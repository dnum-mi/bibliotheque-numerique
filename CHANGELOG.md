# Changelog

## [2.9.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.8.1...v2.9.0) (2024-04-09)


### Features

* add persons in migration and entity organisme ([b05d0d4](https://github.com/dnum-mi/bibliotheque_numerique/commit/b05d0d4d4424c54e72538864158c7ebd756a64e8))
* adding decleration years on organisme ([7fcba42](https://github.com/dnum-mi/bibliotheque_numerique/commit/7fcba425b80f272c58f1daabd24f5e5297f8021f))
* display persons of organisme ([aad1754](https://github.com/dnum-mi/bibliotheque_numerique/commit/aad17542fa25e3af928fc8604dfef5fe6dc9d5ec))
* interface Organisme Person ([7d0d62a](https://github.com/dnum-mi/bibliotheque_numerique/commit/7d0d62a11d6380f626402c085a40f7b21bf4b47c))
* rnf, add isfounder in person of foudation ([b303b52](https://github.com/dnum-mi/bibliotheque_numerique/commit/b303b52628f1b262d5cc2f2239dfe22513164907))
* rnf, add new demarche administration changes for fdd and fe ([8d4631d](https://github.com/dnum-mi/bibliotheque_numerique/commit/8d4631d35fe372c805c23f99d463f621a8241061))
* rnf, change person by demarche administration changes ([a2bf8ea](https://github.com/dnum-mi/bibliotheque_numerique/commit/a2bf8ea8fa06caffdc2bb19b703347ac9ad77b4f))
* rnf, update ds-api-client for debug get dossier with champDescriptor ([ec9d45a](https://github.com/dnum-mi/bibliotheque_numerique/commit/ec9d45a2d276f1923468b5499c2ab7353d3bfd79))
* rnf, update person foudation with new role ([6d4fad8](https://github.com/dnum-mi/bibliotheque_numerique/commit/6d4fad82b07c46f4286a0caf5e04bad8b9877507))


### Bug Fixes

* add filter enum for etat delai ([7608320](https://github.com/dnum-mi/bibliotheque_numerique/commit/760832017ac79c340bed2af74bd3c2e9135750e6))
* add isFondateur and refacto person interface in libShared ([606522c](https://github.com/dnum-mi/bibliotheque_numerique/commit/606522c34c88e55e13bad41d49f8c6a6edefbf93))
* add new type benificiaire ([a4959cb](https://github.com/dnum-mi/bibliotheque_numerique/commit/a4959cb97131b0cfc0bab5232cd6009b012839ca))
* create fields instruction-time for dossiers without date instruction ([86dc3e0](https://github.com/dnum-mi/bibliotheque_numerique/commit/86dc3e08b2ac3c4161e18335df9820b96d45e42d))
* display obsolete due to missing children ([50477b5](https://github.com/dnum-mi/bibliotheque_numerique/commit/50477b5f0c89fe744a0b81f0e8d2891b48260b7a))
* footer mini ([7fe9c20](https://github.com/dnum-mi/bibliotheque_numerique/commit/7fe9c20f75bcd18f2bc3d665385b4167bf3ff8fe))
* get organisme with person fron rnf ([dc01558](https://github.com/dnum-mi/bibliotheque_numerique/commit/dc01558b17154db20d4e8f1f005ecad6bd3d30d5))
* list benificiaires and creators ([c6e05bd](https://github.com/dnum-mi/bibliotheque_numerique/commit/c6e05bd5e85b0de26fdf2ef14fa6f25446dbca71))
* new wording regarding connection failure ([50d07bc](https://github.com/dnum-mi/bibliotheque_numerique/commit/50d07bc0f27840e43f34fe67d04ad66aeda007e6))
* order person role of organisme ([c9bce1c](https://github.com/dnum-mi/bibliotheque_numerique/commit/c9bce1cc474d016e18a44db373512f19b3bb0d82))
* rename isFondateur to isfounder in BN ([fad8851](https://github.com/dnum-mi/bibliotheque_numerique/commit/fad88515546b7af327e42d8c65c537e9b6399dd5))
* resume redis after test-e2e ([b2444e4](https://github.com/dnum-mi/bibliotheque_numerique/commit/b2444e4e8a1d14dc4d47b69440a45b9e2e7ce944))
* rnf, del old person when update foudation ([32d72cd](https://github.com/dnum-mi/bibliotheque_numerique/commit/32d72cd87eda8000dcc81ce61087f85899e1e03c))
* rnf, regroup foundation change method in service ([3998ce4](https://github.com/dnum-mi/bibliotheque_numerique/commit/3998ce452d0d2ade0309d67d93452c5cb79803a4))
* show footer on all pages ([4477465](https://github.com/dnum-mi/bibliotheque_numerique/commit/4477465ceb00ed609ae7786d226179df585d10f6))
* type formatFunctionRef in fonction sync excel ([7ded3a0](https://github.com/dnum-mi/bibliotheque_numerique/commit/7ded3a012d789f3f2c3d6aaffc3b050e641afbcf))
* update query of pagination to get dossiers when filter enum is select no value ([761a4b6](https://github.com/dnum-mi/bibliotheque_numerique/commit/761a4b69842fb0a706c7621bdf51c4b95fbe0cc2))
* wording no role in profile page ([b6ba6e2](https://github.com/dnum-mi/bibliotheque_numerique/commit/b6ba6e2cf41d3111bcd63222b2ea42a41c2e89f0))

## [2.8.1](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.8.0...v2.8.1) (2024-03-28)


### Bug Fixes

* client docker, sed cmd in entrypoint.sh ([48ae71d](https://github.com/dnum-mi/bibliotheque_numerique/commit/48ae71d2807c4180c4d890b32eef6627d17da9dc))

## [2.8.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.7.4...v2.8.0) (2024-03-27)


### Features

* only national admin can configure demarche ([259ce32](https://github.com/dnum-mi/bibliotheque_numerique/commit/259ce32fda120fefd64390da2d49a1a95ab07bbd))


### Bug Fixes

* date traitement can be a string ([b1ae1fa](https://github.com/dnum-mi/bibliotheque_numerique/commit/b1ae1fa3a5176cb01d051ab3d5635966c0e7b8d1))

## [2.7.4](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.7.3...v2.7.4) (2024-03-26)


### Bug Fixes

* debug sed cmd in entrypoint.sh ([90ba956](https://github.com/dnum-mi/bibliotheque_numerique/commit/90ba95658ae650836b2e6815aac750691eb45b0f))

## [2.7.3](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.7.2...v2.7.3) (2024-03-26)


### Bug Fixes

* add licence ag grid ([1327984](https://github.com/dnum-mi/bibliotheque_numerique/commit/1327984f3ab322a427df0902df4aba471e180f33))
* create the feilds even if one champ is not in mapping ([bff58f8](https://github.com/dnum-mi/bibliotheque_numerique/commit/bff58f8acd63aee8d6fe8dba9d2825e59ecbca82))
* debug when user has demarche soft deleted ([c8e343b](https://github.com/dnum-mi/bibliotheque_numerique/commit/c8e343b9f33868dab93e3d5748e20640c1b7140a))
* filter demarche with all cas 0 null undefined ([87a1f24](https://github.com/dnum-mi/bibliotheque_numerique/commit/87a1f24f9e9daeff2a4ffe059e174f9c984e9e5d))
* not return demarche soft deleted for user profile ([6fe4bbb](https://github.com/dnum-mi/bibliotheque_numerique/commit/6fe4bbbbcb0962f24bbbd27561798821aecc9377))
* use license key in var env ([664aa6a](https://github.com/dnum-mi/bibliotheque_numerique/commit/664aa6aa48304a92caf4afa93d339f1dbf59c820))

## [2.7.2](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.7.1...v2.7.2) (2024-03-21)


### Bug Fixes

* upload checksum onl if s3 went correctly ([add9835](https://github.com/dnum-mi/bibliotheque_numerique/commit/add98357953ce6c4ff68e384600193249ce7bb50))

## [2.7.1](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.7.0...v2.7.1) (2024-03-21)


### Bug Fixes

* delete dummy error ([519088b](https://github.com/dnum-mi/bibliotheque_numerique/commit/519088bd1744977e96c72dbae15e2ddc1b470d67))

## [2.7.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.6.2...v2.7.0) (2024-03-21)


### Features

* ✨ [#1180](https://github.com/dnum-mi/bibliotheque_numerique/issues/1180) set fixed list in ag-grid filters ([3a87400](https://github.com/dnum-mi/bibliotheque_numerique/commit/3a87400599d6d99bd562c4745c8c1681568e6d4f))
* ✨ set fixed list of filters for types of organismes ([3d983b9](https://github.com/dnum-mi/bibliotheque_numerique/commit/3d983b90a2b63c543ac43c0e643b25f9f0051239))
* All fields can have code. All tab for organisme files. Sudo can synchronise one dossier at a time. ([7d79ceb](https://github.com/dnum-mi/bibliotheque_numerique/commit/7d79ceb3980157dbe14a0b6e2ce878c2e2d01d7e))
* instructor can only see files from its prefecture ([ab4698e](https://github.com/dnum-mi/bibliotheque_numerique/commit/ab4698ea6c8c180ff55859dc51e4b6da1b48773d))
* synchronising files from rna to organisme ([4e5350b](https://github.com/dnum-mi/bibliotheque_numerique/commit/4e5350b4d8bc2f794e73f5519a2b1ebd0f71c9e6))


### Bug Fixes

* 🐛 properly throw error in interceptor ([9021681](https://github.com/dnum-mi/bibliotheque_numerique/commit/90216819d6d1e02add8dd9cd1a32ba8118ab1578))
* acces files for instructeurs ([f478850](https://github.com/dnum-mi/bibliotheque_numerique/commit/f47885086c5898fe4e128a86fbb84652ec6623e0))
* add function to update and return entity ([812fa0f](https://github.com/dnum-mi/bibliotheque_numerique/commit/812fa0f38e7702d04805127db1f036845d32d23d))
* correct error from s3 and convert stream to buffer for excel ([fc29967](https://github.com/dnum-mi/bibliotheque_numerique/commit/fc29967bf0ee094613b5b6948d1967bebd45170d))
* debug creation total amount fields ([74c1494](https://github.com/dnum-mi/bibliotheque_numerique/commit/74c149408b1eb4effdad8fefc2446e2519f335b7))
* display correctly tab files in fiche dossier ([9c4de29](https://github.com/dnum-mi/bibliotheque_numerique/commit/9c4de298e72c48318bf7514a3f55b7b53575e86d))
* display number files for one dossier with the role restriction ([336d635](https://github.com/dnum-mi/bibliotheque_numerique/commit/336d63552873cb32eb71af0d1a14c37542583e7e))
* File type in configuration of demarche for front ([ac94abd](https://github.com/dnum-mi/bibliotheque_numerique/commit/ac94abd196e5237adb37479c5447e3889a6cbba5))
* from upgrade ds-api-client ([4c9c8a2](https://github.com/dnum-mi/bibliotheque_numerique/commit/4c9c8a2a8abe482dcef2c1415e3141eddb370d44))
* get entity updated ([589528c](https://github.com/dnum-mi/bibliotheque_numerique/commit/589528c13205b8d2dd9ebece0a50fa5182a884d6))
* get files summary of one dossier ([d7477e4](https://github.com/dnum-mi/bibliotheque_numerique/commit/d7477e43c9f0eaf43e6911e8a01e6f42c1bdb817))
* keep new description reference on mappingColumn to find new codes in description ([a7dc95b](https://github.com/dnum-mi/bibliotheque_numerique/commit/a7dc95bb5767b30c85aa00f57e7e8826b59f13da))
* keycode instruction times in service ([e7516d1](https://github.com/dnum-mi/bibliotheque_numerique/commit/e7516d13cd3e514692e00497996633546fc34168))
* listing demarche now return only necessary data ([509ed02](https://github.com/dnum-mi/bibliotheque_numerique/commit/509ed02446d12bfe73c47b7653121d280fcebf5f))
* merge file into files by ds-api-client ([a485c23](https://github.com/dnum-mi/bibliotheque_numerique/commit/a485c23bbdcab0b7ea35d04d3da7c4575e9836d9))
* patch flaky demarche e2e test ([56c9268](https://github.com/dnum-mi/bibliotheque_numerique/commit/56c9268a99df70612b53fb1402ed0c111e43d3c0))
* set date-inconnue if there is a error in filed year ([fb320a1](https://github.com/dnum-mi/bibliotheque_numerique/commit/fb320a10c9fd2a6b03e8199be0bf618bb29b4509))
* set organisme for only dossiers accpeted ([ed2fce1](https://github.com/dnum-mi/bibliotheque_numerique/commit/ed2fce11dd87c1721a578cbdb5ddbdc7dfe1bedd))
* skipping e2e flaky admin test ([29e996f](https://github.com/dnum-mi/bibliotheque_numerique/commit/29e996f740fd3770d4c412b71c6b17b62d608049))
* test-unit for get files with rewrite url ([7cf06f8](https://github.com/dnum-mi/bibliotheque_numerique/commit/7cf06f8066eca5690ee37f3db9a10b4101caea3c))
* type of organisme for pagination to enum ([528d3c2](https://github.com/dnum-mi/bibliotheque_numerique/commit/528d3c270bfa4ac7ce0bfceeec9b7839042cb794))
* update ds-api-client to get dossiers by updated Since ([78dd1cd](https://github.com/dnum-mi/bibliotheque_numerique/commit/78dd1cd91a0a45c8bda6243a39f4e17973bdaced))

## [2.6.2](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.6.1...v2.6.2) (2024-03-05)


### Bug Fixes

* set KUBERNETES_MEMORY_LIMIT to 5 go for build front in gitlab ([2796e8f](https://github.com/dnum-mi/bibliotheque_numerique/commit/2796e8fe74db1eb53074573b06bf7e5ce733445d))

## [2.6.1](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.6.0...v2.6.1) (2024-03-05)


### Bug Fixes

* not change version for http-proxy image ([699bd74](https://github.com/dnum-mi/bibliotheque_numerique/commit/699bd747d7b40c52d1cda3394657ec133575d22c))
* not change version for http-proxy image ([ed98818](https://github.com/dnum-mi/bibliotheque_numerique/commit/ed988187fdd90af0ad3f83ee0371e69d487c8ebe))

## [2.6.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.5.0...v2.6.0) (2024-03-05)


### Features

* gitlab ci build image when is change ([9bcad9d](https://github.com/dnum-mi/bibliotheque_numerique/commit/9bcad9d081b702e2aac6d830bb440babe19df0cb))

## [2.5.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.4.5...v2.5.0) (2024-03-05)


### Features

* ✨ get ready for files summary ([fb50395](https://github.com/dnum-mi/bibliotheque_numerique/commit/fb50395c9e82e69549f5fb2f5ca44a4f7ff06f03))
* add soft-delete demarche in backend ([afa3eb9](https://github.com/dnum-mi/bibliotheque_numerique/commit/afa3eb9e767275c5e4ee763ccba410e0638416aa))
* add soft-delete demarche in client ([50d66ad](https://github.com/dnum-mi/bibliotheque_numerique/commit/50d66adad95a6ee6eb70d6aef7e88c1315ba2da2))
* add soft-delete dossier in backend ([8184523](https://github.com/dnum-mi/bibliotheque_numerique/commit/8184523c8930bfb66d78d0b1163b9cd0381d25bb))
* del endpoint for get log ([de77ef4](https://github.com/dnum-mi/bibliotheque_numerique/commit/de77ef4e791f38a19e0b565d4da1658c881fd779))
* file pagination ([3b9ac6f](https://github.com/dnum-mi/bibliotheque_numerique/commit/3b9ac6f1fd41028b6e4fc35adc2d74f157dccdeb))


### Bug Fixes

* build error because import DsfrButton ([7aecb5c](https://github.com/dnum-mi/bibliotheque_numerique/commit/7aecb5ccae88f24ff1f58b8ee59e335a839c3460))
* change url of file in dossier before send to front ([64922f0](https://github.com/dnum-mi/bibliotheque_numerique/commit/64922f02e31e74b3259f13b7066fe0f63d043ad4))
* debug in test e2e dossier-searche ([89c7385](https://github.com/dnum-mi/bibliotheque_numerique/commit/89c7385f3baefe1575aad65d3faadd030b6635cd))
* dowload pj and add demandeur icon in messagearies ([501cabd](https://github.com/dnum-mi/bibliotheque_numerique/commit/501cabd2dd0f8e0502bb790c1ecb99c4ad012d8a))
* download file in dossier on FRONT ([653d304](https://github.com/dnum-mi/bibliotheque_numerique/commit/653d30462770594079aa33db85fd4a590641fa42))
* error in test-e2e to get annotations which is string ([a01f57a](https://github.com/dnum-mi/bibliotheque_numerique/commit/a01f57afc304f2dc2bf756823d191a4cdf50be42))
* rename deleteDemarche to softDeleteDemarche ([0fb3024](https://github.com/dnum-mi/bibliotheque_numerique/commit/0fb3024932ce5160d834b5a0d4791dd7aed96ae2))
* resolved migration to have cascade SET NULL when deleting organism ([7dd8130](https://github.com/dnum-mi/bibliotheque_numerique/commit/7dd813009e697965e2c5eb98c12ea1bdbf5afc0e))
* route to organismes files ([d3b992b](https://github.com/dnum-mi/bibliotheque_numerique/commit/d3b992b00461b7cfbee2a54ce772531d867bb634))
* synchro-file and join file and dossier ([81e2499](https://github.com/dnum-mi/bibliotheque_numerique/commit/81e24999ee2a5a9851739d4e798b3c9cf65624cf))
* toaster for file with state no uploaded ([02d476d](https://github.com/dnum-mi/bibliotheque_numerique/commit/02d476d7ebefbe7fd8188719dc85b95efd298b33))
* update route file list for organisme and callApi is generic ([44cdab5](https://github.com/dnum-mi/bibliotheque_numerique/commit/44cdab58d7705788d7e56147291ad5e465d2a1e7))


### Performance Improvements

* ⚡ only load file list when the tab is active ([28c0219](https://github.com/dnum-mi/bibliotheque_numerique/commit/28c0219608bcf60d2bc6bed81e4e124c34009015))

## [2.4.5](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.4.4...v2.4.5) (2024-02-23)


### Bug Fixes

* update start worker script for deployer ([a80571e](https://github.com/dnum-mi/bibliotheque_numerique/commit/a80571e198dfff8766e4427b0fade014009c7b1e))

## [2.4.4](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.4.3...v2.4.4) (2024-02-23)


### Bug Fixes

* use bullboard self login, and not login for mailhog ([f2ea044](https://github.com/dnum-mi/bibliotheque_numerique/commit/f2ea0442c6ce9e8e74a4f7917e2040249457d5f3))

## [2.4.3](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.4.2...v2.4.3) (2024-02-22)


### Bug Fixes

* add index.html for auth http proxy ([fa855cb](https://github.com/dnum-mi/bibliotheque_numerique/commit/fa855cb07fc95127bce4611a5ab300349a8e676f))

## [2.4.2](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.4.1...v2.4.2) (2024-02-22)


### Bug Fixes

* run deploy to dev when release is created ([3c19a61](https://github.com/dnum-mi/bibliotheque_numerique/commit/3c19a6182d18a06a6242c8ff9a589a0ddca2ec1e))

## [2.4.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.3.1...v2.4.0) (2024-02-22)


### Features

* date fin exercice - add fiscalEndDateAt in db of bn ([c458094](https://github.com/dnum-mi/bibliotheque_numerique/commit/c458094a745b8fce398ed46eea6e70137ffd29a4))
* date fin exercice - get fiscal end date from rnf to bn ([1ef65ab](https://github.com/dnum-mi/bibliotheque_numerique/commit/1ef65abc1d969d64e7168c119d3152c4cf249bba))

## [2.3.1](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.3.0...v2.3.1) (2024-02-22)


### Bug Fixes

* run deploy to dev when released ([5050f94](https://github.com/dnum-mi/bibliotheque_numerique/commit/5050f948802ef4360b456c0eb90f9609b069e328))

## [2.3.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.2.2...v2.3.0) (2024-02-22)


### Features

* add basic auth for nginx http proxy ([222de27](https://github.com/dnum-mi/bibliotheque_numerique/commit/222de27854bfd50ff24d5b2c6a7a8ad9e44d8737))
* add bn-configuration for client ([0103860](https://github.com/dnum-mi/bibliotheque_numerique/commit/0103860115c586e628a639bb6383478070f0079a))
* add docker redis ([1bf8f1e](https://github.com/dnum-mi/bibliotheque_numerique/commit/1bf8f1e7bb5ab9d805caa2d61c30497dd869faad))
* add new module bn-configuration for save the conf in db ([4a42db3](https://github.com/dnum-mi/bibliotheque_numerique/commit/4a42db37daefd0717b2f7f14faa5ca1f77913cc4))
* add redis config ([bf2da00](https://github.com/dnum-mi/bibliotheque_numerique/commit/bf2da00917aa5179057a7b0ae9486f5ed8719473))
* auto deploy to dev after release ([77022dc](https://github.com/dnum-mi/bibliotheque_numerique/commit/77022dce21bf08ccb55018f4f156076742a1ad3a))
* date fin exercice: add fiscal end date into rnf-server ([70eb34b](https://github.com/dnum-mi/bibliotheque_numerique/commit/70eb34b37d5a87e04cd3ca2eac1d4b1e3331668b))
* export organismes for client ([be2d85a](https://github.com/dnum-mi/bibliotheque_numerique/commit/be2d85a6d8507ef7b830c3e7b2130e698dfd3857))
* export organismes for server ([73d6ed7](https://github.com/dnum-mi/bibliotheque_numerique/commit/73d6ed728c9c9c451430fac64082b0e33739d574))
* new schema - date de fin exercice ([76ab6e7](https://github.com/dnum-mi/bibliotheque_numerique/commit/76ab6e7c7b468dc581f2b31bcfb514ad42290583))


### Bug Fixes

* add method delete for bn-configuration controller ([05fa31a](https://github.com/dnum-mi/bibliotheque_numerique/commit/05fa31a45ff01925fa62812b17ca02ee04d011a6))
* createMissingMandatoryData config when app bootstrap ([0e2de2c](https://github.com/dnum-mi/bibliotheque_numerique/commit/0e2de2ccc6ec89065893402bd56faf0efc225a15))
* move fonction of files of shared-utils ([a26fa1d](https://github.com/dnum-mi/bibliotheque_numerique/commit/a26fa1deacbc7054264560cfd9e58a2cdd5ff898))
* to run server on PRDO (Why?) ([07babca](https://github.com/dnum-mi/bibliotheque_numerique/commit/07babca1147484773b770a586b80bea96dc62bcf))
* update env and code for test:e2e ([e6f45fd](https://github.com/dnum-mi/bibliotheque_numerique/commit/e6f45fdf56eb0af4e197e1a1286b9c11598e1c73))

## [2.2.2](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.2.1...v2.2.2) (2024-01-23)


### Bug Fixes

* add config rna et rnf in worker ([2197276](https://github.com/dnum-mi/bibliotheque_numerique/commit/2197276138fbdc240f51c56b553620c4d8b4ebc8))

## [2.2.1](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.2.0...v2.2.1) (2024-01-23)


### Bug Fixes

* :bug: fix ag-grid custom-filter composition API bug ([60519ec](https://github.com/dnum-mi/bibliotheque_numerique/commit/60519ecd606528d62d29ffae6a3c7e56bb15ba9a))

## [2.2.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.1.0...v2.2.0) (2024-01-22)


### Features

* date filter can now accept a list of defined range ([a4b3983](https://github.com/dnum-mi/bibliotheque_numerique/commit/a4b3983f91760f55a48319815130be4c418b81f8))
* **Worker Update Organisme:** add in cron to update organisme from RNF ([b2b761c](https://github.com/dnum-mi/bibliotheque_numerique/commit/b2b761cde9615260579ce30e9e44fa86d265be18))
* **Worker Update Organisme:** get list fondation from RNF ([807e7c3](https://github.com/dnum-mi/bibliotheque_numerique/commit/807e7c35cb2721e019eee988dca40e9564b05a27))


### Bug Fixes

* query of filter for blank, not blank and in range ([37db3e0](https://github.com/dnum-mi/bibliotheque_numerique/commit/37db3e028b803d6a5c8b6049826214a1b5a25152))
* translate to french name filter date of ag-grid ([55c3764](https://github.com/dnum-mi/bibliotheque_numerique/commit/55c3764fefe96e4ece3bba98ca67b6c9c43cbc62))

## [2.1.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v2.0.0...v2.1.0) (2024-01-16)


### Features

* ✨ handle click on dossier only when allowed ([f4ea015](https://github.com/dnum-mi/bibliotheque_numerique/commit/f4ea0153df1215f9f82e04195e542d17be780a03))
* feat: fix-field Personne moral of demandeur ([2cf3445](https://github.com/dnum-mi/bibliotheque_numerique/commit/2cf344508d63409d06f19408cc6e3aced46e954d))
* fix-field Personne physique of demandeur ([74b5019](https://github.com/dnum-mi/bibliotheque_numerique/commit/74b501907868e7ee86b8cccaab1b858d19bf13fa))
* select a second total ([bd17940](https://github.com/dnum-mi/bibliotheque_numerique/commit/bd179403a13da1224e9ba837fc27a45c0c70c1f1))
* test for fix-field personne physique of demandeur ([7447844](https://github.com/dnum-mi/bibliotheque_numerique/commit/7447844df10de6cdbba9b7b0a6791767247401fe))


### Bug Fixes

* convert the date string to JS Date to get list RNF by date ([a9626e7](https://github.com/dnum-mi/bibliotheque_numerique/commit/a9626e7680d0835c85a116b4250773fce16d3dff))
* failed update mapping when the mapping-column donot have a fix-field ([eaf0523](https://github.com/dnum-mi/bibliotheque_numerique/commit/eaf052344c422d16e1e317c5ba86af0184f4b603))
* to update mappingColumn when fix-field changed ([e4d056c](https://github.com/dnum-mi/bibliotheque_numerique/commit/e4d056c4372bafdf7d4f715dc62df4d4831e6065))
* typo Type of demarches on Page Configure Application ([0e20f4b](https://github.com/dnum-mi/bibliotheque_numerique/commit/0e20f4b6a89b08f0ec0a825de91ef9a4741572f6))

## [2.0.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.9.2...v2.0.0) (2024-01-08)


### ⚠ BREAKING CHANGES

* **database:** version 2.0.0

### Features

* **database:** passage en production ([2ed09fa](https://github.com/dnum-mi/bibliotheque_numerique/commit/2ed09fae3cb62c55b065d9ad02a493cdce3d3649))

## [1.9.2](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.9.1...v1.9.2) (2024-01-08)


### Bug Fixes

* 🐛 redirect to 404 page if resource not found ([fb44ee0](https://github.com/dnum-mi/bibliotheque_numerique/commit/fb44ee02852e07e1e34248a20dc5ddddb57c8ac6))
* 🐛 reset store data appropriately (before get) ([4cf5dab](https://github.com/dnum-mi/bibliotheque_numerique/commit/4cf5dab759170407fb38164ede6929e777652215))
* categories of demarche is in bold ([846da79](https://github.com/dnum-mi/bibliotheque_numerique/commit/846da7931bfc31521465f9081a2daec8607b5d79))
* component test of fiche dossier for the value Etat ([761f153](https://github.com/dnum-mi/bibliotheque_numerique/commit/761f153ca5a91b340ac29aadae2c5c65a23be834))
* direct user to connection on valid email ([8665313](https://github.com/dnum-mi/bibliotheque_numerique/commit/86653131c029140fc6d037a7c87b036fa1d433a0))
* liste demarche number and dates ([b58820f](https://github.com/dnum-mi/bibliotheque_numerique/commit/b58820fea6977cb4aff40766e0e759012e59d930))
* not empty or empty filter.filter for string filter in dossier listing ([cd1b016](https://github.com/dnum-mi/bibliotheque_numerique/commit/cd1b016c4a23e8d6002c7a4692fa3e276387e695))
* null in RNA address ([c6d19e5](https://github.com/dnum-mi/bibliotheque_numerique/commit/c6d19e50a0ce4c43a89fd56981af50074d138b74))
* oui ou non instead of false or true in fiche dossier ([6fbfe10](https://github.com/dnum-mi/bibliotheque_numerique/commit/6fbfe100b390a50971ae5a4347fa27e79a15b998))
* use mapping column in search providers instead of looking from type with a query request on field table. ([c78f7bb](https://github.com/dnum-mi/bibliotheque_numerique/commit/c78f7bb818888f4f3410164aade64826d33952cf))
* using status badge in dossier header ([3b8acba](https://github.com/dnum-mi/bibliotheque_numerique/commit/3b8acba7ed65d2027f36cd10dcab60c5f88bf2d1))

## [1.9.1](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.9.0...v1.9.1) (2024-01-08)


### Bug Fixes

* ✏️ fix typos on obsolete ([a84ab15](https://github.com/dnum-mi/bibliotheque_numerique/commit/a84ab1575a5b1565139796ae64edb80e43337f07))
* 🐛 fix blank-page-on-new-version bug ([e92038d](https://github.com/dnum-mi/bibliotheque_numerique/commit/e92038ddbab8c08f7a81c9e24d73215213bce682))
* 🐛 fix missing icon ([d4ccdfa](https://github.com/dnum-mi/bibliotheque_numerique/commit/d4ccdfaf2466f2a15ce002526491fae33bea77e3))
* 🐛 fix quick links in header ([d90680f](https://github.com/dnum-mi/bibliotheque_numerique/commit/d90680f41ba7d427baa32283a079e98693e39865))
* 🚸 improve ui/ux if no custom filters for user ([0f39441](https://github.com/dnum-mi/bibliotheque_numerique/commit/0f394410a9f3fc9a45c371fd5b5531adca6170eb))
* add config instrutcion time for worker ([7184462](https://github.com/dnum-mi/bibliotheque_numerique/commit/7184462398ea193fc866c65015b7ff70b372a929))
* error de test sur client ([3e34901](https://github.com/dnum-mi/bibliotheque_numerique/commit/3e34901deb895040c8a823d4d89c4b44c71032fe))
* reverse fistname and lastname in mail to validate inscription ([a18c677](https://github.com/dnum-mi/bibliotheque_numerique/commit/a18c677d79f0f9e6f2cd4d1107f52f75d1f2ba8c))

## [1.9.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.8.0...v1.9.0) (2024-01-05)

### Features

* ✨ use custom footer ([f669a69](https://github.com/dnum-mi/bibliotheque_numerique/commit/f669a6991817529cece88d41266111afad8bf983))
* admin can now see if user is verified ([b951c88](https://github.com/dnum-mi/bibliotheque_numerique/commit/b951c88230d90c8dcfa41fd75a09da2acf7c0fd5))
* job name in signup is now required. ([5ce6af4](https://github.com/dnum-mi/bibliotheque_numerique/commit/5ce6af4678d109ee60242e346b5bd5137ea2f99f))
* update page accessibility ([61bd123](https://github.com/dnum-mi/bibliotheque_numerique/commit/61bd1233c73ebbe03046f00d46b1e93a5cc44484))
* user is now aware of obsolete 'affichage' ([69c3799](https://github.com/dnum-mi/bibliotheque_numerique/commit/69c379946be62b6ba07d2fe66983f51cec89d8a1))

### Bug Fixes

* :bug: fix e2e tests ([f868c81](https://github.com/dnum-mi/bibliotheque_numerique/commit/f868c810d59affbaae717fd22f2cb96a38332ca2))
* 🐛 corrige le test de connexion ([3d5fa82](https://github.com/dnum-mi/bibliotheque_numerique/commit/3d5fa821ebfbf557dd181a41a3064771959d2b66))
* 🐛 Fix ag-grid error ([2ad10f5](https://github.com/dnum-mi/bibliotheque_numerique/commit/2ad10f56797a51ea2033554d78556571ab309cb8))
* dont reset filter by default, let front control it ([10caa17](https://github.com/dnum-mi/bibliotheque_numerique/commit/10caa17eda31ee20d83119cb6904b300d566ff82))
* give orginal name of column in affichage if columnLabel has been unchecked ([87aa90f](https://github.com/dnum-mi/bibliotheque_numerique/commit/87aa90f955d3054bce81a9df4040acfdb0ca4020))
* preventing sql injection on the searchs requests ([541e23d](https://github.com/dnum-mi/bibliotheque_numerique/commit/541e23d1dc7093835fb834d8f72beb50dd25f756))

## [1.8.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.7.0...v1.8.0) (2023-12-22)

### Features

* :sparkles: display attachments in demarche dossier ([ab63fac](https://github.com/dnum-mi/bibliotheque_numerique/commit/ab63facaf806f293e9c86665a25e66db47c9984c))
* :sparkles: redesign configuration page ([5345c38](https://github.com/dnum-mi/bibliotheque_numerique/commit/5345c382a08a3e7033bb29bc3996bc90aa5c7730))

### Bug Fixes

* annonation privee is singular in mapping column source ([ed9e243](https://github.com/dnum-mi/bibliotheque_numerique/commit/ed9e243479ea809fe04cfbb51de8d877bfe32151))
* blank filter string is working ([9dfd078](https://github.com/dnum-mi/bibliotheque_numerique/commit/9dfd0789b40f4606c72b4fd1b375f9377a6de9a9))
* call endpoint dossier-search when a demarche have not repeatable fields ([1e474ee](https://github.com/dnum-mi/bibliotheque_numerique/commit/1e474ee459b4c3b886762a051dc5cb5bb68b2fba))
* createdAt and UpdatedAt from new migration db ([d6c63bc](https://github.com/dnum-mi/bibliotheque_numerique/commit/d6c63bc632e1dfcbc5c481891eaad3cfde648495))
* del not work code in release action ([72cf5ce](https://github.com/dnum-mi/bibliotheque_numerique/commit/72cf5cee05f2a5cc0336367363dec8494ef3ac97))
* fields-search now separated multiple repeatble fields ([680ba34](https://github.com/dnum-mi/bibliotheque_numerique/commit/680ba343c28d44a7c17322d0c16341f2aea9f98a))
* no display switch by vue by dossier ([641e1ea](https://github.com/dnum-mi/bibliotheque_numerique/commit/641e1eae7bf35ba0a90a6835eb0bda5f1893363a))
* update a good default hashed password ([9a7f396](https://github.com/dnum-mi/bibliotheque_numerique/commit/9a7f3967a79e4d4569c868a6796e137a435c540a))

## [1.7.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.6.15...v1.7.0) (2023-12-19)

### Features

* add footer in template and show version run-env accessibility in app ([cea6d64](https://github.com/dnum-mi/bibliotheque_numerique/commit/cea6d645c422a6668669b5c29f6d38f24ebbe9f1))
* **Profile:** dto to update profile ([66e0f9c](https://github.com/dnum-mi/bibliotheque_numerique/commit/66e0f9c9cf239c77093b967f286bd219827d51fc))
* **Profile:** editable field for profile in FRONT ([91ec325](https://github.com/dnum-mi/bibliotheque_numerique/commit/91ec325640a7f288d1c558f3f0b3f305626f35de))
* **Profile:** endpoint to update profile in sever ([50a2162](https://github.com/dnum-mi/bibliotheque_numerique/commit/50a2162b2dd34b279352b88cbfdbe61b54084b40))
* **Profile:** get porofile user updated without logout ([bfcedd7](https://github.com/dnum-mi/bibliotheque_numerique/commit/bfcedd7a2edcd05311a2589ce272df723b99a690))
* **Profile:** udpate profile in api client and store ([db02305](https://github.com/dnum-mi/bibliotheque_numerique/commit/db023056c6078f4ad912b9519d772e89eda4c735))

### Bug Fixes

* :pencil2: rename poste by fonction ([d671cdc](https://github.com/dnum-mi/bibliotheque_numerique/commit/d671cdc960c3e7f51044fb9d74629ca6b8bb5173))
* add deps sanitize-html ([cf45146](https://github.com/dnum-mi/bibliotheque_numerique/commit/cf451461842e59468c90c2f06e255aa920f9cb7a))
* add page cookies for client ([a2b0d95](https://github.com/dnum-mi/bibliotheque_numerique/commit/a2b0d952e155533f8a616f33a25a19765b63bed8))
* add version and run-env in api health ([d78a994](https://github.com/dnum-mi/bibliotheque_numerique/commit/d78a99450006a5df6597f158c22919dc374de71c))
* add vue accessibility ([e3436fa](https://github.com/dnum-mi/bibliotheque_numerique/commit/e3436fa5f5f2b746e27cc309067b05079c6ebf5f))
* debug build docker image ([4d8154e](https://github.com/dnum-mi/bibliotheque_numerique/commit/4d8154e6237accf430be95f1ff78b4702778552e))
* Error message for status 500 ([f7c5cfa](https://github.com/dnum-mi/bibliotheque_numerique/commit/f7c5cfa66310e7ca37d8724cfb1447d76e8063be))
* prevent user from clicking to an organisme if we didnt find it ([a58de70](https://github.com/dnum-mi/bibliotheque_numerique/commit/a58de70043621b87b4e40dfb4cdffd27197de0ea))
* remove place-holder of "job title" input on sign-up ([e27380f](https://github.com/dnum-mi/bibliotheque_numerique/commit/e27380f476cfe5fea1b7754c4e8702b33d9e03bb))
* render in number for array from excel ([63052d6](https://github.com/dnum-mi/bibliotheque_numerique/commit/63052d6ef4411707ed74557bb7603038452c2f60))
* reset on logout ([fc2b12e](https://github.com/dnum-mi/bibliotheque_numerique/commit/fc2b12e1bb2fcfb7e0eb8f243572f5ad3350e43f))
* RNF: error message for address no exist in dossier DS ([a137f55](https://github.com/dnum-mi/bibliotheque_numerique/commit/a137f55dbb11033fb8c22e4a716b6c9f142bb0f1))
* sanitize html to display messages of dossier ([9d8f5bc](https://github.com/dnum-mi/bibliotheque_numerique/commit/9d8f5bcf007cd5f644addb8b44d7cb1be515e999))
* **sign-up:** send job title to server ([7249364](https://github.com/dnum-mi/bibliotheque_numerique/commit/7249364693d50cc683ab578d9cbb87f7c7849c12))
* substring 6 instead of 7 ([ff5aa1c](https://github.com/dnum-mi/bibliotheque_numerique/commit/ff5aa1cfc74f6b480098d79b69ee6f94d6e2c9b2))
* synchro dossier after to update demarche DS ([5ec1d17](https://github.com/dnum-mi/bibliotheque_numerique/commit/5ec1d17040118b93c0007227af507b368f7ecc1d))
* test component dossier: fail when id = 0 in generateDossier ([af34bee](https://github.com/dnum-mi/bibliotheque_numerique/commit/af34bee38dbcdeb6856912db002b042a27f3ef4c))
* unit test to synchronize dossiers after to update demarche DS ([5d86bfd](https://github.com/dnum-mi/bibliotheque_numerique/commit/5d86bfdeb36032839da45bb212737121127683ef))
* update script fixture in package to commonjs ([ff72a09](https://github.com/dnum-mi/bibliotheque_numerique/commit/ff72a09ed024ec7375a6b6f923209ae21e90e515))

## [v1.6.15] - 2023-12-23

### Added

* Toutes les fonctionnalités développées jusqu’ici
