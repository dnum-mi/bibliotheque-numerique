# Changelog

## [1.9.0](https://github.com/dnum-mi/bibliotheque_numerique/compare/v1.8.0...v1.9.0) (2024-01-05)


### Features

* ✨ use custom footer ([f669a69](https://github.com/dnum-mi/bibliotheque_numerique/commit/f669a6991817529cece88d41266111afad8bf983))
* admin can now see if user is verified ([b951c88](https://github.com/dnum-mi/bibliotheque_numerique/commit/b951c88230d90c8dcfa41fd75a09da2acf7c0fd5))
* job name in signup is now required. ([5ce6af4](https://github.com/dnum-mi/bibliotheque_numerique/commit/5ce6af4678d109ee60242e346b5bd5137ea2f99f))
* update page accessibility ([61bd123](https://github.com/dnum-mi/bibliotheque_numerique/commit/61bd1233c73ebbe03046f00d46b1e93a5cc44484))
* user is now aware of obselet 'affichage' ([69c3799](https://github.com/dnum-mi/bibliotheque_numerique/commit/69c379946be62b6ba07d2fe66983f51cec89d8a1))


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
