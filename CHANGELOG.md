# Changelog

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
